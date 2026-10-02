import { CompetencyStatus } from '@/types';

export interface CompetencyVerificationInput {
  name: string;
  status: CompetencyStatus;
  evidence_quote?: string | null;
  plain_explanation?: string | null;
  source_reference?: string | null;
  jd_requirement?: string | null;
}

export interface VerifiedCompetencyResult extends CompetencyVerificationInput {
  status: CompetencyStatus;
  evidence_quote: string | null;
  verified: boolean;
}

export function cleanString(str: string): string {
  return str.replace(/\s+/g, ' ').trim().toLowerCase();
}

/**
 * Checks that each evidence_quote is a verbatim substring of the extracted resume text.
 * If not, downgrade the rating and drop the quote.
 */
export function verifyEvidence(
  item: CompetencyVerificationInput,
  rawResumeText: string
): VerifiedCompetencyResult {
  if (!item.evidence_quote || item.evidence_quote.trim() === '') {
    return {
      ...item,
      evidence_quote: null,
      verified: false,
    };
  }

  const cleanResume = cleanString(rawResumeText);
  const cleanQuote = cleanString(item.evidence_quote);

  const isVerbatimSubstring = cleanResume.includes(cleanQuote);

  if (!isVerbatimSubstring) {
    // Quote is not in source text: downgrade rating if strong, drop quote
    const downgradedStatus: CompetencyStatus =
      item.status === 'strong' ? 'needs_proof' : item.status;

    return {
      ...item,
      status: downgradedStatus,
      evidence_quote: null,
      plain_explanation: item.plain_explanation
        ? `${item.plain_explanation} (Evidence quote unverified in source text; rating downgraded to prevent hallucination.)`
        : 'Evidence quote unverified in source text.',
      verified: false,
    };
  }

  return {
    ...item,
    evidence_quote: item.evidence_quote,
    verified: true,
  };
}
