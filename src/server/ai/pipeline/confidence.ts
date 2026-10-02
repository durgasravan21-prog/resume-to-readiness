export interface ConfidenceMetrics {
  confidenceScore: number;
  confidenceTier: 'high' | 'medium' | 'low';
  isLowConfidence: boolean;
  reason: string;
}

export function calculateConfidence(
  rawResumeText: string,
  verifiedQuotesCount: number,
  totalCompetencies: number
): ConfidenceMetrics {
  const wordCount = rawResumeText.trim().split(/\s+/).length;

  if (wordCount < 100) {
    return {
      confidenceScore: 35,
      confidenceTier: 'low',
      isLowConfidence: true,
      reason: 'Scant resume signal (fewer than 100 words detected). High risk of unverified inference.',
    };
  }

  const verifiedRatio = totalCompetencies > 0 ? verifiedQuotesCount / totalCompetencies : 0;

  if (wordCount < 250 || verifiedRatio < 0.25) {
    return {
      confidenceScore: 65,
      confidenceTier: 'medium',
      isLowConfidence: false,
      reason: 'Moderate evidence density. Some competencies rely on inferred experience.',
    };
  }

  return {
    confidenceScore: 92,
    confidenceTier: 'high',
    isLowConfidence: false,
    reason: 'High signal integrity. Strong verbatim textual density across key competency benchmarks.',
  };
}
