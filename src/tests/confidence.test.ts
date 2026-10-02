import { describe, it, expect } from 'vitest';
import { calculateConfidence } from '../server/ai/pipeline/confidence';

describe('calculateConfidence', () => {
  it('assigns low confidence when resume word count is fewer than 100 words', () => {
    const scantText = 'Aarav Sundaram, computer science student. React developer.';
    const result = calculateConfidence(scantText, 1, 5);

    expect(result.confidenceTier).toBe('low');
    expect(result.isLowConfidence).toBe(true);
    expect(result.confidenceScore).toBe(35);
  });

  it('assigns high confidence when resume text has sufficient density and strong verified evidence', () => {
    const longText = new Array(120).fill('Demonstrated full stack engineering principles with React and TypeScript.').join(' ');
    const result = calculateConfidence(longText, 4, 5);

    expect(result.confidenceTier).toBe('high');
    expect(result.isLowConfidence).toBe(false);
    expect(result.confidenceScore).toBe(92);
  });
});
