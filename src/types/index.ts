import { z } from 'zod';

export type UserRole = 'student' | 'coordinator' | 'admin';
export type CompetencyStatus = 'strong' | 'needs_proof' | 'missing';
export type AnalysisStatus = 'queued' | 'extracting' | 'reading_role' | 'matching' | 'explaining' | 'done' | 'failed';
export type RoadmapPhase = 'prioritize' | 'sequence' | 'prove';
export type TaskPriority = 'High' | 'Medium' | 'Foundational';

export interface User {
  id: string;
  college_id: string | null;
  name: string;
  email: string;
  role: UserRole;
  roll_number?: string | null;
  degree?: string | null;
  branch?: string | null;
  graduation_year?: string | null;
  cgpa?: string | null;
  school_10th?: string | null;
  school_10th_marks?: string | null;
  school_12th?: string | null;
  school_12th_marks?: string | null;
  college_name?: string | null;
  achievements?: string[];
  achievements_text?: string | null;
  avatar_url?: string | null;
  created_at?: string | null;
}

export interface TargetRole {
  id: string;
  college_id?: string | null;
  title: string;
  category: string;
  companies?: string | null;
  description?: string | null;
  benchmark_code?: string | null;
  skills: string[];
  min_cgpa?: string | null;
  created_by?: string | null;
  census_count?: number;
  created_at?: string | null;
}

export interface Resume {
  id: string;
  user_id: string;
  file_name: string;
  file_size: string;
  file_url?: string | null;
  raw_text?: string | null;
  has_text_layer: boolean;
  created_at?: string | null;
}

export interface Analysis {
  id: string;
  user_id: string;
  resume_id?: string | null;
  target_role_id?: string | null;
  custom_jd?: string | null;
  status: AnalysisStatus;
  readiness_score: number;
  confidence_score: number;
  summary_sentence?: string | null;
  top_gap?: string | null;
  created_at?: string | null;
}

export interface AnalysisItem {
  id: string;
  analysis_id: string;
  name: string;
  status: CompetencyStatus;
  status_label?: string | null;
  jd_requirement?: string | null;
  evidence_quote?: string | null;
  source_reference?: string | null;
  plain_explanation?: string | null;
  created_at?: string | null;
}

export interface RoadmapItem {
  id: string;
  analysis_id: string;
  phase: RoadmapPhase;
  title: string;
  description?: string | null;
  created_at?: string | null;
}

export interface RoadmapTask {
  id: string;
  roadmap_item_id: string;
  analysis_id: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  hours_estimate?: string | null;
  evidence_outcome?: string | null;
  is_completed: boolean;
  created_at?: string | null;
}

export interface MentorMessage {
  id: string;
  analysis_id: string;
  user_id: string;
  sender: 'student' | 'mentor';
  sender_name: string;
  message_text: string;
  action_card_json?: any;
  created_at?: string | null;
}

export interface CoachNote {
  id: string;
  student_id: string;
  coordinator_id: string;
  note_text: string;
  created_at?: string | null;
}

export interface StudentProfileInput {
  name: string;
  email?: string;
  school_10th?: string;
  school_10th_marks?: string;
  school_12th?: string;
  school_12th_marks?: string;
  college_name?: string;
  degree?: string;
  branch?: string;
  graduation_year?: string;
  cgpa?: string;
  achievements_text?: string;
}

// Zod schemas
export const studentProfileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  school_10th: z.string().optional(),
  school_10th_marks: z.string().optional(),
  school_12th: z.string().optional(),
  school_12th_marks: z.string().optional(),
  college_name: z.string().optional(),
  degree: z.string().optional(),
  branch: z.string().optional(),
  graduation_year: z.string().optional(),
  cgpa: z.string().optional(),
  achievements_text: z.string().optional(),
});

export const targetRoleCreateSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  category: z.string().min(2, 'Category is required'),
  companies: z.string().optional(),
  description: z.string().optional(),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  min_cgpa: z.string().optional(),
  benchmark_code: z.string().optional(),
});
