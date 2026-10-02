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
    db: {
      schema: 'readiness',
    },
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
  const isDemoMode = process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  if (!user && demoRole && isDemoMode) {
    const role = demoRole;
    if (pathname === '/') {
      if (role === 'student') return NextResponse.redirect(new URL('/home', request.url));
      if (role === 'mentor') return NextResponse.redirect(new URL('/mentor', request.url));
      if (role === 'coordinator') return NextResponse.redirect(new URL('/tpc', request.url));
      if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (pathname.startsWith('/home') || pathname.startsWith('/analyses')) {
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

  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (user) {
    // Lookup profile from server-controlled profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, onboarding_completed')
      .eq('id', user.id)
      .single();

    const role = profile?.role || 'student';
    const onboardingCompleted = profile?.onboarding_completed ?? false;

    // If onboarding is incomplete, redirect student to /onboarding
    if (role === 'student' && !onboardingCompleted && !pathname.startsWith('/onboarding') && !pathname.startsWith('/api')) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    // Role-based route guard
    if (pathname === '/' || (pathname.startsWith('/onboarding') && onboardingCompleted)) {
      if (role === 'student') return NextResponse.redirect(new URL('/home', request.url));
      if (role === 'mentor') return NextResponse.redirect(new URL('/mentor', request.url));
      if (role === 'coordinator') return NextResponse.redirect(new URL('/tpc', request.url));
      if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
    }

    if (pathname.startsWith('/home') || pathname.startsWith('/analyses')) {
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
  }

  return response;
}
