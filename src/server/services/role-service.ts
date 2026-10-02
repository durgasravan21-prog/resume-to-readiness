import 'server-only';
import { can } from '../auth/permissions';
import { AppError } from './errors';
import { getTargetRoles, insertTargetRole } from '../db/queries/roles';
import { User, TargetRole } from '@/types';

export async function listRoles(user: User): Promise<TargetRole[]> {
  if (!can(user, 'view', 'target_role')) {
    throw new AppError('FORBIDDEN', 'Access denied to target roles library.', 403);
  }
  return getTargetRoles();
}

export async function createRole(user: User, roleData: Partial<TargetRole>): Promise<TargetRole> {
  if (!can(user, 'create', 'target_role', { college_id: user.college_id })) {
    throw new AppError('FORBIDDEN', 'Only Placement Coordinators can upload benchmark roles.', 403);
  }

  const role = await insertTargetRole({
    ...roleData,
    college_id: user.college_id,
    created_by: user.name,
  });

  if (!role) {
    throw new AppError('CREATION_FAILED', 'Could not create benchmark role.', 500);
  }

  return role;
}
