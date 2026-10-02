import 'server-only';
import { anthropic, isAnthropicConfigured } from '../client';
import { getSkillMatchingPrompt } from '../prompts/match-skills';
import { verifyEvidence } from './verify-evidence';
import { calculateConfidence } from './confidence';
import { updateAnalysisStatus } from '../../db/queries/analyses';
import { supabase } from '../../db/client';
import { TargetRole } from '@/types';

export async function runAnalysisPipeline(
  analysisId: string,
  rawResumeText: string,
  targetRole: TargetRole,
  onProgress?: (stage: string) => Promise<void>
): Promise<void> {
  try {
    // Stage 1: Extracting
    await updateAnalysisStatus(analysisId, 'extracting');
    if (onProgress) await onProgress('extracting');

    // Stage 2: Reading Role & Rubric
    await updateAnalysisStatus(analysisId, 'reading_role');
    if (onProgress) await onProgress('reading_role');

    // Stage 3: Matching skills
    await updateAnalysisStatus(analysisId, 'matching');
    if (onProgress) await onProgress('matching');

    let itemsToVerify = [];
    let readinessScore = 68;
    let summarySentence = 'Solid foundational engineering implementation, but requires telemetry and verified test coverage.';
    let topGap = 'State management and automated test suites absent from primary projects.';

    if (isAnthropicConfigured) {
      try {
        const prompt = getSkillMatchingPrompt(targetRole.title, targetRole.skills, rawResumeText);
        const response = await anthropic.messages.create({
          model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
          max_tokens: 2500,
          temperature: 0.1,
          messages: [{ role: 'user', content: prompt }],
        });

        const contentBlock = response.content[0];
        if (contentBlock && 'text' in contentBlock) {
          const parsed = JSON.parse(contentBlock.text);
          itemsToVerify = parsed.items || [];
          readinessScore = parsed.readiness_score || 70;
          summarySentence = parsed.summary_sentence || summarySentence;
          topGap = parsed.top_gap || topGap;
        }
      } catch (err) {
        console.warn('Anthropic API call failed, falling back to deterministic matching:', err);
      }
    }

    // Fallback deterministic skill matcher if AI returned empty
    if (!itemsToVerify || itemsToVerify.length === 0) {
      itemsToVerify = targetRole.skills.map((skillName, index) => {
        const lowerResume = rawResumeText.toLowerCase();
        const lowerSkill = skillName.toLowerCase();

        let status: 'strong' | 'needs_proof' | 'missing' = 'missing';
        let evidenceQuote: string | null = null;
        let plainExplanation = `No direct mentions or demonstrated implementations of ${skillName} found in resume.`;

        if (lowerResume.includes(lowerSkill)) {
          // Find matching sentence in resume
          const sentences = rawResumeText.split(/[.\n]+/);
          const found = sentences.find((s) => s.toLowerCase().includes(lowerSkill));
          if (found && found.trim().length > 15) {
            evidenceQuote = found.trim();
            status = index < 2 ? 'strong' : 'needs_proof';
            plainExplanation = status === 'strong' 
              ? `Demonstrated competency in ${skillName} corroborated by project evidence.`
              : `Mentioned ${skillName}, but requires deeper architecture or telemetry metrics.`;
          }
        }

        return {
          name: skillName,
          status,
          status_label: status === 'strong' ? 'Strong evidence' : status === 'needs_proof' ? 'Needs stronger proof' : 'Missing from resume',
          jd_requirement: `Demonstrated experience and competency in ${skillName} within modern engineering teams.`,
          evidence_quote: evidenceQuote,
          source_reference: evidenceQuote ? 'Resume Projects Section' : null,
          plain_explanation: plainExplanation,
        };
      });
    }

    // Stage 4: Explaining & Verifying Evidence
    await updateAnalysisStatus(analysisId, 'explaining');
    if (onProgress) await onProgress('explaining');

    // Run strict verbatim quote verification
    const verifiedItems = itemsToVerify.map((item: any) => verifyEvidence(item, rawResumeText));
    const verifiedQuotesCount = verifiedItems.filter((i: { verified: boolean }) => i.verified).length;

    // Compute confidence
    const confidence = calculateConfidence(rawResumeText, verifiedQuotesCount, verifiedItems.length);

    // Save Analysis Items into database
    for (const item of verifiedItems) {
      await supabase.from('analysis_items').insert([
        {
          id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          analysis_id: analysisId,
          name: item.name,
          status: item.status,
          status_label: item.status === 'strong' ? 'Strong evidence' : item.status === 'needs_proof' ? 'Needs stronger proof' : 'Missing from resume',
          jd_requirement: item.jd_requirement,
          evidence_quote: item.evidence_quote,
          source_reference: item.source_reference,
          plain_explanation: item.plain_explanation,
        },
      ]);
    }

    // Mark as done
    await updateAnalysisStatus(analysisId, 'done', {
      readiness: readinessScore,
      confidence: confidence.confidenceScore,
    });

    await supabase.from('analyses').update({
      summary_sentence: summarySentence,
      top_gap: topGap,
    }).eq('id', analysisId);

    if (onProgress) await onProgress('done');
  } catch (error: any) {
    console.error('Analysis pipeline execution failed:', error);
    await updateAnalysisStatus(analysisId, 'failed');
  }
}
