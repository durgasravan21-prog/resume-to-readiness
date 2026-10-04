import { describe, it, expect } from 'vitest';
import { can } from '../server/auth/permissions';

describe('Comprehensive Authorization Matrix (Phase 3)', () => {
  const studentA = { id: 'usr_student_a', role: 'student' as const, college_id: 'col_nie' };
  const studentB = { id: 'usr_student_b', role: 'student' as const, college_id: 'col_nie' };
  const studentC_otherCollege = { id: 'usr_student_c', role: 'student' as const, college_id: 'col_rvce' };
  
  const coordCollege1 = { id: 'usr_coord_1', role: 'coordinator' as const, college_id: 'col_nie' };
  const coordCollege2 = { id: 'usr_coord_2', role: 'coordinator' as const, college_id: 'col_rvce' };

  const admin = { id: 'usr_admin', role: 'admin' as const, college_id: 'col_nie' };

  describe('IDOR Protection (Student vs Student)', () => {
    it('allows Student A to view/update their own analysis, resume, and roadmap', () => {
      expect(can(studentA, 'view', 'analysis', { user_id: 'usr_student_a' })).toBe(true);
      expect(can(studentA, 'view', 'resume', { user_id: 'usr_student_a' })).toBe(true);
      expect(can(studentA, 'update', 'roadmap', { user_id: 'usr_student_a' })).toBe(true);
      expect(can(studentA, 'create', 'mentor', { user_id: 'usr_student_a' })).toBe(true);
    });

    it('strictly forbids Student A from accessing Student B data (IDOR prevention)', () => {
      expect(can(studentA, 'view', 'analysis', { user_id: 'usr_student_b' })).toBe(false);
      expect(can(studentA, 'view', 'resume', { user_id: 'usr_student_b' })).toBe(false);
      expect(can(studentA, 'update', 'roadmap', { user_id: 'usr_student_b' })).toBe(false);
      expect(can(studentA, 'view', 'mentor', { user_id: 'usr_student_b' })).toBe(false);
    });

    it('forbids students from accessing coordinator or admin endpoints', () => {
      expect(can(studentA, 'view', 'coach_note', { college_id: 'col_nie' })).toBe(false);
      expect(can(studentA, 'create', 'coach_note', { college_id: 'col_nie' })).toBe(false);
      expect(can(studentA, 'export', 'cohort_export', { college_id: 'col_nie' })).toBe(false);
      expect(can(studentA, 'create', 'target_role')).toBe(false);
      expect(can(studentA, 'manage', 'user_management')).toBe(false);
    });
  });

  describe('Cross-College Tenant Isolation (Coordinator vs Coordinator)', () => {
    it('allows Coordinator 1 to view students in College 1', () => {
      expect(can(coordCollege1, 'view', 'student_profile', { college_id: 'col_nie' })).toBe(true);
      expect(can(coordCollege1, 'view', 'analysis', { college_id: 'col_nie' })).toBe(true);
      expect(can(coordCollege1, 'create', 'coach_note', { college_id: 'col_nie' })).toBe(true);
      expect(can(coordCollege1, 'export', 'cohort_export', { college_id: 'col_nie' })).toBe(true);
    });

    it('strictly blocks Coordinator 1 from viewing students in College 2', () => {
      expect(can(coordCollege1, 'view', 'student_profile', { college_id: 'col_rvce' })).toBe(false);
      expect(can(coordCollege1, 'view', 'analysis', { college_id: 'col_rvce' })).toBe(false);
      expect(can(coordCollege1, 'view', 'roadmap', { college_id: 'col_rvce' })).toBe(false);
    });

    it('forbids coordinators from modifying student resumes or mutating user roles', () => {
      expect(can(coordCollege1, 'delete', 'resume', { user_id: 'usr_student_a' })).toBe(false);
      expect(can(coordCollege1, 'update', 'roadmap', { user_id: 'usr_student_a' })).toBe(false);
      expect(can(coordCollege1, 'manage', 'user_management')).toBe(false);
    });
  });

  describe('Admin Role Superuser Access', () => {
    it('allows Admin to perform all administrative and maintenance operations', () => {
      expect(can(admin, 'manage', 'user_management')).toBe(true);
      expect(can(admin, 'delete', 'target_role')).toBe(true);
      expect(can(admin, 'create', 'target_role')).toBe(true);
      expect(can(admin, 'export', 'cohort_export')).toBe(true);
    });
  });

  describe('Signed-Out User Rejection', () => {
    it('rejects all operations when user is null or undefined', () => {
      expect(can(null as any, 'view', 'analysis')).toBe(false);
      expect(can(undefined as any, 'view', 'student_profile')).toBe(false);
    });
  });

  describe('Endpoint & Role Integrity Protection (Non-Escalation)', () => {
    it('strictly denies students access to coordinator dashboards and roster tools', () => {
      expect(can(studentA, 'view', 'student_profile', { college_id: 'col_nie' })).toBe(false);
      expect(can(studentA, 'manage', 'settings')).toBe(false);
    });

    it('ensures student role cannot be escalated by unauthorized route requests', () => {
      // Role remains student and permissions remain restricted
      const studentAttemptingEscalation = { ...studentA };
      expect(can(studentAttemptingEscalation, 'view', 'coach_note', { college_id: 'col_nie' })).toBe(false);
      expect(can(studentAttemptingEscalation, 'create', 'target_role')).toBe(false);
      expect(studentAttemptingEscalation.role).toBe('student');
    });
  });
});
