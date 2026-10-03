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
  const isPublicPath = pathname === '/' || pathname.startsWith('/auth') || pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.');

  const demoRole = request.cookies.get('readiness_role')?.value;

  if (!user && demoRole) {
    const role = demoRole;
    if (pathname === '/') {
      if (role === 'student') return NextResponse.redirect(new URL('/home', request.url));
      if (role === 'mentor') return NextResponse.redirect(new URL('/mentor', request.url));
      if (role === 'coordinator') return NextResponse.redirect(new URL('/tpc', request.url));
      if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (pathname.startsWith('/onboarding') && (request.cookies.get('readiness_onboarding_completed')?.value === 'true' || request.cookies.get('readiness_user_id')?.value === '36ac8503-c1c5-4865-b3f5-51c302a3e1ee')) {
      return NextResponse.redirect(new URL('/home', request.url));
    }
    if (pathname.startsWith('/home') || pathname.startsWith('/analyses') || pathname.startsWith('/settings') || pathname.startsWith('/onboarding')) {
      if (role !== 'student' && role !== 'admin') {
        return NextResponse.redirect(new URL(role === 'coordinator' ? '/tpc' : '/mentor', request.url));
      }
    }
    if (pathname.startsWith('/tpc')) {
      if (role !== 'coordinator' && role !== 'admin') {
        return NextResponse.redirect(new URL('/home', request.url));
      }
    }
    if (pathname.startsWith('/mentor')) {
      if (role !== 'mentor' && role !== 'admin') {
        return NextResponse.redirect(new URL('/home', request.url));
      }
    }
    if (pathname.startsWith('/admin')) {
      if (role !== 'admin') {
        return NextResponse.redirect(new URL('/home', request.url));
      }
    }
    return response;
  }

  if (!user && !demoRole && !isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (user) {
    // Lookup profile from server-controlled profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, onboarding_completed')
      .or(`id.eq.${user.id},email.eq.${user.email || ''}`)
      .single();

    let role = profile?.role || 'student';
    const isDurga = user.email === 'durgasravan21@gmail.com' || user.id === '36ac8503-c1c5-4865-b3f5-51c302a3e1ee';
    const cookieOnboarded = request.cookies.get('readiness_onboarding_completed')?.value === 'true' || isDurga;
    const onboardingCompleted = profile?.onboarding_completed || cookieOnboarded;

    // Allow durgasravan21@gmail.com, admins, and faculty coordinators to freely toggle views
    const activeViewRole = request.cookies.get('readiness_role')?.value;
    const isSpecialUser =
      isDurga ||
      profile?.role === 'admin' ||
      profile?.role === 'coordinator' ||
      user.email?.includes('placement') ||
      user.email?.includes('nie.ac.in');

    if (isSpecialUser) {
      if (pathname.startsWith('/tpc')) {
        role = 'coordinator';
      } else if (pathname.startsWith('/mentor')) {
        role = 'coordinator';
      } else if (pathname.startsWith('/home') || pathname.startsWith('/analyses') || pathname.startsWith('/settings')) {
        role = 'student';
      } else if (activeViewRole === 'coordinator' || activeViewRole === 'student' || activeViewRole === 'mentor') {
        role = activeViewRole;
      }
    }

    // If onboarding is incomplete, redirect student to /onboarding unless viewing analyses
    if (role === 'student' && !onboardingCompleted && !pathname.startsWith('/onboarding') && !pathname.startsWith('/analyses') && !pathname.startsWith('/api')) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    // Role-based route guard
    if (pathname === '/' || (pathname.startsWith('/onboarding') && onboardingCompleted)) {
      if (role === 'student' || isDurga) return NextResponse.redirect(new URL('/home', request.url));
      if (role === 'mentor') return NextResponse.redirect(new URL('/mentor', request.url));
      if (role === 'coordinator') return NextResponse.redirect(new URL('/tpc', request.url));
      if (role === 'admin') return NextResponse.redirect(new URL('/home', request.url));
    }

    if (pathname.startsWith('/home') || pathname.startsWith('/analyses') || pathname.startsWith('/settings')) {
      if (role !== 'student' && role !== 'admin' && !isSpecialUser) {
        return NextResponse.redirect(new URL(role === 'coordinator' ? '/tpc' : '/mentor', request.url));
      }
    }

    if (pathname.startsWith('/tpc')) {
      if (role !== 'coordinator' && role !== 'admin' && !isSpecialUser) {
        return NextResponse.redirect(new URL('/home', request.url));
      }
    }

    if (pathname.startsWith('/mentor')) {
      if (role !== 'mentor' && role !== 'coordinator' && role !== 'admin' && !isSpecialUser) {
        return NextResponse.redirect(new URL('/home', request.url));
      }
    }

    if (pathname.startsWith('/admin')) {
      if (role !== 'admin') {
        return NextResponse.redirect(new URL('/home', request.url));
      }
    }
  }

  return response;
}
