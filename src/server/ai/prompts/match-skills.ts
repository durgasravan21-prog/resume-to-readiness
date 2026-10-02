export function getSkillMatchingPrompt(roleTitle: string, benchmarkSkills: string[], resumeText: string): string {
  return `You are a Senior Technical Hiring Lead and Placement Evaluator analyzing an engineering candidate against the target role "${roleTitle}".

BENCHMARK SKILLS & RUBRIC:
${benchmarkSkills.map((s) => `- ${s}`).join('\n')}

EXTRACTED RESUME TEXT:
"""
${resumeText}
"""

EVALUATION RULES:
1. For each skill, classify into one of three statuses:
   - "strong": Candidate provides direct, quantitative proof, architectural depth, or production usage.
   - "needs_proof": Candidate mentions the skill or technology, but lacks depth, testing, metrics, or central architecture.
   - "missing": No relevant mention in projects, coursework, or work experience.
2. CRITICAL AUDIT RULE: If you provide an "evidence_quote", it MUST be a 100% VERBATIM substring copied directly from the candidate's resume text above. Do NOT paraphrase or alter words. If no exact sentence exists, set evidence_quote to null.
3. Compute a holistic readiness_score (0 to 100) and confidence_score (0 to 100).
4. Return a concise summary_sentence and top_gap in plain editorial English.

Respond ONLY with valid JSON matching the schema.`;
}
