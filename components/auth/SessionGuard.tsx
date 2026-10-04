'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getSession } from '@/lib/auth';

const PROTECTED_PREFIXES = [
  '/home',
  '/analyses',
  '/tpc',
  '/mentor',
  '/settings',
  '/admin',
];

export default function SessionGuard() {
  const pathname = usePathname();

  useEffect(() => {
    // Determine if current route is protected
    const isProtected = PROTECTED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
    );

    if (!isProtected) return;

    const verifySession = () => {
      const session = getSession();
      if (!session) {
        // User logged out or session expired; immediately replace history and redirect to /login
        window.location.replace('/login');
      }
    };

    // 1. Initial client-side check on route navigation
    verifySession();

    // 2. bfcache (Back/Forward Cache) invalidation:
    // When the user presses browser Back/Forward, pageshow fires with event.persisted = true
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted || !getSession()) {
        verifySession();
      }
    };

    // 3. Popstate event listener for browser history navigation
    const handlePopState = () => {
      verifySession();
    };

    // 4. Multi-tab logout synchronization via localStorage events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'readiness_auth_session' && !e.newValue) {
        verifySession();
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [pathname]);

  return null;
}
