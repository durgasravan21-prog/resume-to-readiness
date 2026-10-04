import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yslupcclthqltvvwjvjr.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbHVwY2NsdGhxbHR2dndqdmpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MjA0MzYsImV4cCI6MjA5ODk5NjQzNn0.XN9oa1bOtXf0ZsqViLDk5OB_xVT-wFh7GPDEFzzgtPU';

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // Public paths allowed without authentication
  const isPublicPath =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.');

  const demoRole = request.cookies.get('readiness_role')?.value;

  // Track student paths so unauthorized attempts to /tpc can bounce back to exact origin
  if (pathname.startsWith('/analyses') || pathname === '/home' || pathname.startsWith('/settings')) {
    response.cookies.set('readiness_last_student_path', pathname, {
      path: '/',
      maxAge: 3600,
      sameSite: 'lax',
    });
  }

  // Helper to construct security restriction redirects with no-store headers
  const makeRestrictedRedirect = (targetPath: string) => {
    const res = NextResponse.redirect(new URL(targetPath, request.url));
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('Expires', '0');
    return res;
  };

  // Helper to determine bounce target when student attempts forbidden route
  const getStudentBounceUrl = (forbiddenRoute: string) => {
    const lastStudentPath = request.cookies.get('readiness_last_student_path')?.value;
    const referer = request.headers.get('referer');
    let bounceBase = '/home';
    if (lastStudentPath && (lastStudentPath.startsWith('/analyses') || lastStudentPath === '/home')) {
      bounceBase = lastStudentPath;
    } else if (referer && referer.includes('/analyses')) {
      try {
        const refUrl = new URL(referer);
        bounceBase = refUrl.pathname;
      } catch {
        bounceBase = '/home';
      }
    }
    const sep = bounceBase.includes('?') ? '&' : '?';
    return `${bounceBase}${sep}restricted=${forbiddenRoute.replace('/', '')}`;
  };

  // 1. Unauthenticated users: strictly reject any non-public paths
  if (!user && !demoRole) {
    if (!isPublicPath) {
      return makeRestrictedRedirect(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
    return response;
  }

  // 2. Resolve true role and privileges
  let role: string = 'student';
  let onboardingCompleted = false;

  if (user) {
    // Lookup profile from server-controlled profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, onboarding_completed')
      .or(`id.eq.${user.id},email.eq.${user.email || ''}`)
      .single();

    const profileRole = profile?.role || 'student';
    const isOwner = user.email === 'durgasravan21@gmail.com' || user.id === '36ac8503-c1c5-4865-b3f5-51c302a3e1ee';
    const cookieOnboarded = request.cookies.get('readiness_onboarding_completed')?.value === 'true' || isOwner;
    onboardingCompleted = profile?.onboarding_completed || cookieOnboarded;

    const isPrivileged =
      isOwner ||
      profileRole === 'coordinator' ||
      profileRole === 'admin' ||
      user.email?.includes('placement') ||
      user.email?.includes('nie.ac.in');

    const activeViewRole = request.cookies.get('readiness_role')?.value;

    if (isPrivileged) {
      // Privileged accounts can switch between roles via explicit cookie (set by TopNav toggle)
      if (activeViewRole === 'coordinator') {
        role = 'coordinator';
      } else if (activeViewRole === 'mentor') {
        role = 'mentor';
      } else if (activeViewRole === 'student') {
        role = 'student';
      } else if (activeViewRole === 'admin' && (isOwner || profileRole === 'admin')) {
        role = 'admin';
      } else {
        // Default to student for Durga/students, coordinator for faculty
        role = profileRole === 'coordinator' ? 'coordinator' : 'student';
      }
    } else {
      // Standard student profile cannot elevate itself via cookie or URL
      role = 'student';
    }
  } else if (demoRole) {
    role = demoRole;
    onboardingCompleted = request.cookies.get('readiness_onboarding_completed')?.value === 'true';
  }

  // 3. Prevent logged-in users from hitting login/signup
  if (pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    if (role === 'coordinator') return NextResponse.redirect(new URL('/tpc', request.url));
    if (role === 'mentor') return NextResponse.redirect(new URL('/mentor', request.url));
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // 4. Student onboarding guard
  if (role === 'student' && !onboardingCompleted && !pathname.startsWith('/onboarding') && !pathname.startsWith('/analyses') && !pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  // 5. RESTRICT ROLE ENDPOINTS:
  // Training & Placement Cell (TPC) coordinator portal: strictly coordinator or admin
  if (pathname.startsWith('/tpc')) {
    if (role !== 'coordinator' && role !== 'admin') {
      // User is student or lacks coordinator role -> STRICTLY RESTRICT ACTION!
      return makeRestrictedRedirect(getStudentBounceUrl('tpc'));
    }
  }

  // Faculty mentor portal: strictly mentor, coordinator, or admin
  if (pathname === '/mentor' || pathname.startsWith('/mentor/')) {
    if (role !== 'mentor' && role !== 'coordinator' && role !== 'admin') {
      return makeRestrictedRedirect(getStudentBounceUrl('mentor'));
    }
  }

  // Admin portal: strictly admin
  if (pathname.startsWith('/admin')) {
    if (role !== 'admin') {
      return makeRestrictedRedirect(getStudentBounceUrl('admin'));
    }
  }

  // Student portal (/home): coordinators are redirected to /tpc unless explicitly in student view
  if (pathname === '/home') {
    if (role === 'coordinator') {
      return NextResponse.redirect(new URL('/tpc', request.url));
    }
    if (role === 'mentor') {
      return NextResponse.redirect(new URL('/mentor', request.url));
    }
  }

  if (!isPublicPath) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}
