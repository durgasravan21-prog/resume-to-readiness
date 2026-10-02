import { UserRole } from '@/types';

export interface ReadinessSession {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    collegeId?: string;
  };
}

/**
 * Strict domain validator:
 * Confirms email format, ensures exactly one '@', matches against allowed institutional domain.
 */
export function isAllowedDomain(email: string, allowedDomain: string = 'nie.ac.in'): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  
  // Basic RFC pattern validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) return false;

  const parts = trimmed.split('@');
  if (parts.length !== 2) return false;
  
  const [localPart, domainPart] = parts;
  if (!localPart || localPart.length === 0) return false;

  const normalizedAllowed = allowedDomain.trim().toLowerCase();
  return domainPart === normalizedAllowed;
}

/**
 * Validates and sanitizes post-login redirect targets to prevent Open Redirect vulnerabilities.
 * Only allows relative internal paths starting with a single '/' and not '//'.
 */
export function sanitizeRedirectUrl(url: string | null | undefined, defaultUrl: string = '/home'): string {
  if (!url || typeof url !== 'string') return defaultUrl;
  const trimmed = url.trim();

  // Reject protocol-relative URLs (//evil.com) and javascript: schemes
  if (trimmed.startsWith('//') || trimmed.startsWith('\\') || trimmed.toLowerCase().startsWith('javascript:')) {
    return defaultUrl;
  }

  // Reject absolute URLs with schemes (http://, https://)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return defaultUrl;
  }

  // Must begin with a single '/'
  if (!trimmed.startsWith('/')) {
    return defaultUrl;
  }

  return trimmed;
}

export const DEMO_USERS = {
  student: {
    id: 'usr_aarav_01',
    name: 'Aarav Sundaram',
    email: 'aarav.sundaram@nie.ac.in',
    role: 'student' as UserRole,
    collegeId: 'col_nie',
  },
  coordinator: {
    id: 'usr_coord_01',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@nie.ac.in',
    role: 'coordinator' as UserRole,
    collegeId: 'col_nie',
  },
  admin: {
    id: 'usr_admin_01',
    name: 'Placement Dean Office',
    email: 'admin@nie.ac.in',
    role: 'admin' as UserRole,
    collegeId: 'col_nie',
  },
};
