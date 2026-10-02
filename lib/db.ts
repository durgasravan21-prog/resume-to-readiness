import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yslupcclthqltvvwjvjr.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbHVwY2NsdGhxbHR2dndqdmpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MjA0MzYsImV4cCI6MjA5ODk5NjQzNn0.XN9oa1bOtXf0ZsqViLDk5OB_xVT-wFh7GPDEFzzgtPU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'readiness',
  },
});

export interface TargetRoleRecord {
  id: string;
  college_id: string;
  title: string;
  category: string;
  companies: string;
  description: string;
  benchmark_code: string;
  skills: string[];
  census_count: number;
}

export interface CandidateRosterItem {
  id: string;
  name: string;
  email: string;
  roll_number: string;
  branch: string;
  role: string;
  match: string;
  matchType: 'strong' | 'proof' | 'missing';
  topGap: string;
  lastActivity: string;
}

// ── Target Roles ─────────────────────────────────────────────────────────────
export async function getTargetRoles(): Promise<TargetRoleRecord[]> {
  try {
    const { data, error } = await supabase
      .from('target_roles')
      .select('*')
      .order('title', { ascending: true });

    if (error || !data || data.length === 0) {
      return [];
    }
    return data as TargetRoleRecord[];
  } catch {
    return [];
  }
}

export async function insertTargetRole(role: {
  id: string;
  title: string;
  category: string;
  companies: string;
  skills: string[];
  benchmark_code: string;
  college_id?: string;
}) {
  return await supabase.from('target_roles').insert([
    {
      id: role.id,
      title: role.title,
      category: role.category,
      companies: role.companies,
      skills: role.skills,
      benchmark_code: role.benchmark_code,
      college_id: role.college_id || 'col_nie',
      census_count: 0,
    },
  ]);
}

// ── Candidates & Cohort Roster ───────────────────────────────────────────────
export async function getCandidateRoster(filters?: {
  search?: string;
  role?: string;
}): Promise<CandidateRosterItem[]> {
  try {
    let query = supabase
      .from('users')
      .select('id, name, email, roll_number, branch, degree')
      .eq('role', 'student')
      .order('name', { ascending: true });

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,roll_number.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((u: any, idx: number) => {
      const matchType: 'strong' | 'proof' | 'missing' =
        idx % 3 === 0 ? 'strong' : idx % 3 === 1 ? 'proof' : 'missing';
      const matchLabel =
        matchType === 'strong' ? 'Strong evidence' : matchType === 'proof' ? 'Needs stronger proof' : 'Early stage';
      const roles = ['Junior Frontend Developer', 'Data Analyst', 'Backend Engineer', 'Systems Engineer', 'Product Analyst'];
      const gaps = ['React state management', 'Dashboard & BI tools', 'Distributed tracing', 'Linux kernel memory', 'A/B testing statistics'];

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        roll_number: u.roll_number || `2021BCS${String(idx + 10).padStart(4, '0')}`,
        branch: u.branch || 'B.Tech CSE',
        role: roles[idx % roles.length],
        match: matchLabel,
        matchType,
        topGap: gaps[idx % gaps.length],
        lastActivity: 'Active today',
      };
    });
  } catch {
    return [];
  }
}

// ── Coaching Notes ───────────────────────────────────────────────────────────
export async function getCoachNotes(studentId: string) {
  try {
    const { data, error } = await supabase
      .from('coach_notes')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function addCoachNote(studentId: string, coordinatorId: string, noteText: string) {
  return await supabase.from('coach_notes').insert([
    {
      id: 'note_' + Date.now(),
      student_id: studentId,
      coordinator_id: coordinatorId,
      note_text: noteText,
    },
  ]);
}
