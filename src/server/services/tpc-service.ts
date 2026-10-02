import 'server-only';
import { can } from '../auth/permissions';
import { AppError } from './errors';
import { getTpcStudents, insertCoachNote, getCoachNotesByStudentId, TpcStudentSummary } from '../db/queries/tpc';
import { supabase } from '../db/client';
import { User, CoachNote } from '@/types';

export async function getCohortRoster(
  user: User,
  filters?: { branch?: string; status?: string; search?: string }
): Promise<TpcStudentSummary[]> {
  if (!can(user, 'view', 'student_profile', { college_id: user.college_id })) {
    throw new AppError('FORBIDDEN', 'Access denied to placement coordinator roster.', 403);
  }

  // Audit log view
  await supabase.from('audit_log').insert([
    {
      id: 'aud_' + Date.now(),
      user_id: user.id,
      action: 'view_cohort_roster',
      details: { filters },
    },
  ]);

  return getTpcStudents(filters);
}

export async function createStudentCoachNote(
  user: User,
  studentId: string,
  noteText: string
): Promise<CoachNote> {
  if (!can(user, 'create', 'coach_note', { college_id: user.college_id })) {
    throw new AppError('FORBIDDEN', 'Only Placement Coordinators can add private coaching notes.', 403);
  }

  const note = await insertCoachNote(studentId, user.id, noteText);

  // Audit log note creation
  await supabase.from('audit_log').insert([
    {
      id: 'aud_' + Date.now(),
      user_id: user.id,
      action: 'create_coach_note',
      target_id: studentId,
      details: { note_length: noteText.length },
    },
  ]);

  return note;
}

export async function generateCohortCsv(user: User): Promise<string> {
  if (!can(user, 'export', 'cohort_export', { college_id: user.college_id })) {
    throw new AppError('FORBIDDEN', 'Access denied to cohort CSV export.', 403);
  }

  const students = await getTpcStudents();

  // Audit log export
  await supabase.from('audit_log').insert([
    {
      id: 'aud_' + Date.now(),
      user_id: user.id,
      action: 'export_cohort_csv',
      details: { student_count: students.length },
    },
  ]);

  // Neutralize CSV injection formula characters (=, +, -, @)
  const sanitizeCell = (val: string | number) => {
    const str = String(val ?? '');
    if (/^[=+\-@]/.test(str)) {
      return `"'${str.replace(/"/g, '""')}"`;
    }
    return `"${str.replace(/"/g, '""')}"`;
  };

  const headers = ['Student ID', 'Name', 'Email', 'Degree', 'Branch', 'Graduation Year', 'CGPA', 'Target Role', 'Readiness Score', 'Status Tier', 'Primary Gap'];
  const rows = students.map((s) => [
    sanitizeCell(s.id),
    sanitizeCell(s.name),
    sanitizeCell(s.email),
    sanitizeCell(s.degree || 'B.Tech'),
    sanitizeCell(s.branch || ''),
    sanitizeCell(s.graduation_year || '2026'),
    sanitizeCell(s.cgpa || '0.0'),
    sanitizeCell(s.targetRoleTitle || ''),
    sanitizeCell(s.readinessScore || 0),
    sanitizeCell(s.statusBadge || ''),
    sanitizeCell(s.topGap || ''),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
