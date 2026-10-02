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
  min_cgpa?: string;
}) {
  const { data, error } = await supabase
    .from('target_roles')
    .insert([
      {
        id: role.id,
        college_id: 'col_nie',
        title: role.title,
        category: role.category,
        companies: role.companies,
        benchmark_code: role.benchmark_code,
        skills: role.skills,
        min_cgpa: role.min_cgpa || '7.0',
        census_count: 0,
      },
    ])
    .select();

  return { data, error };
}
