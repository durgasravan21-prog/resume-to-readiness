import 'server-only';
import { can } from '../auth/permissions';
import { AppError } from './errors';
import { getAnalysisById, getAnalysisItems, createAnalysis } from '../db/queries/analyses';
import { getTargetRoles } from '../db/queries/roles';
import { runAnalysisPipeline } from '../ai/pipeline/run-analysis';
import { supabase } from '../db/client';
import { User, Analysis, AnalysisItem } from '@/types';
import { MIN_CUSTOM_JD_LENGTH } from '@/lib/constants';

export async function initiateAnalysis(
  user: User,
  payload: {
    resumeId?: string;
    roleId?: string;
    customJd?: string;
  }
): Promise<{ analysisId: string }> {
  if (!can(user, 'create', 'analysis', { user_id: user.id })) {
    throw new AppError('FORBIDDEN', 'Permission denied.', 403);
  }

  if (payload.customJd && payload.customJd.length < MIN_CUSTOM_JD_LENGTH) {
    throw new AppError(
      'INVALID_JD',
      `Custom job description must be at least ${MIN_CUSTOM_JD_LENGTH} characters for statistical confidence.`,
      400
    );
  }

  const analysisId = 'anl_' + Date.now();

  // Create queued analysis record
  await createAnalysis({
    id: analysisId,
    user_id: user.id,
    resume_id: payload.resumeId || null,
    target_role_id: payload.roleId || 'role_jfd',
    custom_jd: payload.customJd || null,
    status: 'queued',
  });

  // Fetch resume text
  let rawResumeText = 'Aarav Sundaram\nFull-stack engineer with React, TypeScript, and Node.js experience.';
  if (payload.resumeId) {
    const { data: resume } = await supabase
      .from('resumes')
      .select('raw_text')
      .eq('id', payload.resumeId)
      .single();
    if (resume?.raw_text) rawResumeText = resume.raw_text;
  }

  // Fetch target role details
  const roles = await getTargetRoles();
  const targetRole = roles.find((r) => r.id === payload.roleId) || roles[0];

  // Run pipeline asynchronously
  setTimeout(async () => {
    try {
      await runAnalysisPipeline(analysisId, rawResumeText, targetRole);
    } catch (err) {
      console.error('Async pipeline error:', err);
    }
  }, 100);

  return { analysisId };
}

export async function getAnalysisDetail(
  user: User,
  analysisId: string
): Promise<{ analysis: Analysis; items: AnalysisItem[] }> {
  const analysis = await getAnalysisById(analysisId);
  if (!analysis) {
    throw new AppError('NOT_FOUND', 'Analysis session not found.', 404);
  }

  if (!can(user, 'view', 'analysis', { user_id: analysis.user_id })) {
    throw new AppError('FORBIDDEN', 'Access denied to this diagnostic ledger.', 403);
  }

  const items = await getAnalysisItems(analysisId);
  return { analysis, items };
}

export async function getAnalysisStatus(analysisId: string): Promise<{
  status: Analysis['status'];
  readiness_score: number;
  confidence_score: number;
}> {
  const analysis = await getAnalysisById(analysisId);
  if (!analysis) {
    throw new AppError('NOT_FOUND', 'Analysis not found.', 404);
  }

  return {
    status: analysis.status,
    readiness_score: analysis.readiness_score,
    confidence_score: analysis.confidence_score,
  };
}
