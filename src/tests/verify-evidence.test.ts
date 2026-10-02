import { describe, it, expect } from 'vitest';
import { verifyEvidence } from '../server/ai/pipeline/verify-evidence';

describe('verifyEvidence', () => {
  const sampleResume = `
    Aarav Sundaram
    Senior Undergraduate in Computer Science & Engineering.
    Projects:
    - FinTech Ledger: Migrated 14 frontend repositories to TypeScript with zero "any" types and custom generic API wrappers.
    - Component Architecture: Built dashboard UI using React hooks and local useState.
  `;

  it('keeps "strong" status when evidence quote is a verbatim substring', () => {
    const item = {
      name: 'TypeScript Strict Typing',
      status: 'strong' as const,
      evidence_quote: 'Migrated 14 frontend repositories to TypeScript with zero "any" types and custom generic API wrappers.',
      plain_explanation: 'Strong verified evidence from FinTech project.',
    };

    const result = verifyEvidence(item, sampleResume);
    expect(result.verified).toBe(true);
    expect(result.status).toBe('strong');
    expect(result.evidence_quote).not.toBeNull();
  });

  it('downgrades "strong" to "needs_proof" and drops quote if quote is fabricated/not in resume', () => {
    const hallucinatedItem = {
      name: 'Redux Enterprise State',
      status: 'strong' as const,
      evidence_quote: 'Architected enterprise Redux store with 100% normalized slices and middleware.',
      plain_explanation: 'Claimed enterprise Redux experience.',
    };

    const result = verifyEvidence(hallucinatedItem, sampleResume);
    expect(result.verified).toBe(false);
    expect(result.status).toBe('needs_proof');
    expect(result.evidence_quote).toBeNull();
    expect(result.plain_explanation).toContain('unverified in source text');
  });

  it('handles empty quotes gracefully without crashing', () => {
    const emptyItem = {
      name: 'Automated Testing',
      status: 'missing' as const,
      evidence_quote: null,
      plain_explanation: 'No testing found.',
    };

    const result = verifyEvidence(emptyItem, sampleResume);
    expect(result.verified).toBe(false);
    expect(result.status).toBe('missing');
    expect(result.evidence_quote).toBeNull();
  });
});
