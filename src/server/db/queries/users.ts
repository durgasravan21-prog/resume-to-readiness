import 'server-only';
import { supabase } from '../client';
import { User, StudentProfileInput } from '@/types';

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as User;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) return null;
  return data as User;
}

export async function upsertStudentProfile(userId: string, profile: StudentProfileInput): Promise<User | null> {
  const payload = {
    id: userId,
    name: profile.name,
    email: profile.email || `${userId}@nie.ac.in`,
    role: 'student',
    school_10th: profile.school_10th || null,
    school_10th_marks: profile.school_10th_marks || null,
    school_12th: profile.school_12th || null,
    school_12th_marks: profile.school_12th_marks || null,
    college_name: profile.college_name || 'National Institute of Engineering',
    degree: profile.degree || 'B.Tech',
    branch: profile.branch || 'Computer Science & Engineering',
    graduation_year: profile.graduation_year || '2026',
    cgpa: profile.cgpa || '8.2',
    achievements_text: profile.achievements_text || null,
  };

  const { data, error } = await supabase
    .from('users')
    .upsert(payload)
    .select()
    .single();

  if (error) {
    return payload as unknown as User;
  }
  return data as User;
}
