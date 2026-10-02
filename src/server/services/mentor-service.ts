import 'server-only';
import { can } from '../auth/permissions';
import { AppError } from './errors';
import { checkRateLimit } from '../rate-limit';
import { getAnalysisById, getAnalysisItems } from '../db/queries/analyses';
import { supabase } from '../db/client';
import { User, MentorMessage } from '@/types';

export async function sendMentorMessage(
  user: User,
  analysisId: string,
  messageText: string
): Promise<{ reply: string; actionCard?: any }> {
  if (!can(user, 'create', 'mentor', { user_id: user.id })) {
    throw new AppError('FORBIDDEN', 'Access denied.', 403);
  }

  const rateCheck = await checkRateLimit(user.id, 'mentor_per_hour');
  if (!rateCheck.success) {
    throw new AppError('RATE_LIMITED', 'Mentor consultation message rate limit exceeded (30/hour). Please wait.', 429);
  }

  const analysis = await getAnalysisById(analysisId);
  const items = await getAnalysisItems(analysisId);
  const missingItems = items.filter((i) => i.status !== 'strong').map((i) => i.name);

  // Generate grounded advisory reply
  let reply = `Looking at your diagnostic ledger, closing the gap in **${missingItems[0] || 'state management'}** is your highest-yield priority before recruiter screens. Most candidates list Redux, but recruiters specifically test whether you can normalize entities and avoid unnecessary re-renders.`;

  if (messageText.toLowerCase().includes('interview') || messageText.toLowerCase().includes('question')) {
    reply = `In technical placement rounds for ${analysis?.target_role_id || 'Frontend Roles'}, interviewers will present an unoptimized dashboard and ask: "Why is the entire table re-rendering when a single filter dropdown changes?" You should demonstrate memoization with \`useMemo\` and atomic store selectors rather than blanket React.memo.`;
  } else if (messageText.toLowerCase().includes('resume') || messageText.toLowerCase().includes('bullet')) {
    reply = `To elevate your bullet point from "Needs stronger proof" to "Strong evidence", rephrase using the Action-Context-Metric formula: *"Architected centralized Zustand state store with persistent local storage caching, reducing inter-component prop-drilling by 60% across 14 views."*`;
  }

  const actionCard = {
    title: 'Recommended Sprint Step',
    stepNumber: 'Step 01',
    description: 'Implement a normalized store selector to demonstrate re-render containment.',
    route: `/analyses/${analysisId}/gap/item_react_state`,
  };

  // Record student message
  await supabase.from('mentor_messages').insert([
    {
      id: 'msg_' + Date.now() + '_user',
      analysis_id: analysisId,
      user_id: user.id,
      sender: 'student',
      sender_name: user.name,
      message_text: messageText,
    },
    {
      id: 'msg_' + Date.now() + '_mentor',
      analysis_id: analysisId,
      user_id: user.id,
      sender: 'mentor',
      sender_name: 'Placement Advisor',
      message_text: reply,
      action_card_json: actionCard,
    },
  ]);

  return { reply, actionCard };
}
