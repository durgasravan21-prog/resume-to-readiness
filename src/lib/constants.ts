export const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MIN_CUSTOM_JD_LENGTH = 300; // 300 characters for statistical confidence

export const RATING_LABELS = {
  strong: 'Strong evidence',
  needs_proof: 'Needs stronger proof',
  missing: 'Missing from resume',
} as const;

export const ROADMAP_PHASES = {
  prioritize: 'Prioritize (Weeks 1-2)',
  sequence: 'Sequence (Weeks 3-4)',
  prove: 'Prove (Weeks 5-6)',
} as const;

export const TASK_PRIORITIES = {
  high: 'High',
  medium: 'Medium',
  foundational: 'Foundational',
} as const;

export const USER_ROLES = {
  student: 'student',
  coordinator: 'coordinator',
  admin: 'admin',
} as const;

export const RATE_LIMITS = {
  upload_per_hour: 10,
  analyses_per_hour: 5,
  mentor_per_hour: 30,
} as const;

export const CONFIDENCE_LEVELS = {
  high: 'High Confidence',
  medium: 'Medium Confidence',
  low: 'Low Confidence (Scant Signal)',
} as const;
