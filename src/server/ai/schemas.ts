import { z } from 'zod';

export const extractedResumeSchema = z.object({
  fullName: z.string(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      year: z.string().optional(),
      score: z.string().optional(),
    })
  ),
  skills: z.array(z.string()),
  projects: z.array(
    z.object({
      title: z.string(),
      technologies: z.array(z.string()),
      bulletPoints: z.array(z.string()),
    })
  ),
  workExperience: z.array(
    z.object({
      role: z.string(),
      organization: z.string(),
      duration: z.string().optional(),
      responsibilities: z.array(z.string()),
    })
  ),
});

export const matchedCompetencySchema = z.object({
  name: z.string(),
  status: z.enum(['strong', 'needs_proof', 'missing']),
  status_label: z.string(),
  jd_requirement: z.string(),
  evidence_quote: z.string().nullable(),
  source_reference: z.string().nullable(),
  plain_explanation: z.string(),
});

export const analysisResultSchema = z.object({
  readiness_score: z.number().min(0).max(100),
  confidence_score: z.number().min(0).max(100),
  summary_sentence: z.string(),
  top_gap: z.string(),
  items: z.array(matchedCompetencySchema),
});

export const generatedTaskSchema = z.object({
  title: z.string(),
  description: z.string(),
  priority: z.enum(['High', 'Medium', 'Foundational']),
  hours_estimate: z.string(),
  evidence_outcome: z.string(),
});

export const generatedRoadmapSchema = z.object({
  phases: z.array(
    z.object({
      phase: z.enum(['prioritize', 'sequence', 'prove']),
      title: z.string(),
      description: z.string(),
      tasks: z.array(generatedTaskSchema),
    })
  ),
});
