import { UserRole } from '@/types';

export type Action = 'view' | 'create' | 'update' | 'delete' | 'export' | 'manage';
export type Resource = 
  | 'analysis'
  | 'resume'
  | 'roadmap'
  | 'mentor'
  | 'student_profile'
  | 'coach_note'
  | 'target_role'
  | 'user_management'
  | 'cohort_export';

export interface ResourceTarget {
  user_id?: string | null;
  student_id?: string | null;
  college_id?: string | null;
  created_by?: string | null;
}

export function can(
  user: { id: string; role: UserRole; college_id?: string | null },
  action: Action,
  resource: Resource,
  target?: ResourceTarget
): boolean {
  if (!user) return false;

  // Admin has global access to all actions and resources
  if (user.role === 'admin') {
    return true;
  }

  // Coordinator permissions
  if (user.role === 'coordinator') {
    if (resource === 'user_management') return false; // Admin only

    if (resource === 'target_role') {
      return ['view', 'create', 'update'].includes(action);
    }

    if (resource === 'cohort_export' || resource === 'coach_note') {
      return true;
    }

    if (['student_profile', 'analysis', 'roadmap'].includes(resource)) {
      if (action === 'view') {
        if (!target?.college_id || !user.college_id) return true;
        return target.college_id === user.college_id;
      }
      return false;
    }

    return false;
  }

  // Student permissions
  if (user.role === 'student') {
    if (['coach_note', 'cohort_export', 'target_role', 'user_management'].includes(resource)) {
      if (resource === 'target_role' && action === 'view') return true;
      return false;
    }

    if (['analysis', 'resume', 'roadmap', 'mentor'].includes(resource)) {
      if (!target) return true;
      const ownerId = target.user_id || target.student_id;
      if (!ownerId) return true;
      return ownerId === user.id;
    }

    if (resource === 'student_profile') {
      if (!target) return true;
      return target.user_id === user.id;
    }
  }

  return false;
}
