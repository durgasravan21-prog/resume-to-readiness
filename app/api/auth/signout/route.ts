import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getSupabase(request: NextRequest) {
  let cookieStore: any;
  try {
    cookieStore = await cookies();
  } catch (e) {
    cookieStore = {
      get: (name: string) => request.cookies.get(name)?.value,
      set: () => {},
      delete: () => {},
      getAll: () => request.cookies.getAll() || [],
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yslupcclthqltvvwjvjr.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbHVwY2NsdGhxbHR2dndqdmpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MjA0MzYsImV4cCI6MjA5ODk5NjQzNn0.XN9oa1bOtXf0ZsqViLDk5OB_xVT-wFh7GPDEFzzgtPU';

  return {
    supabase: createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value || request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try { cookieStore.set?.(name, value, options); } catch (_) {}
        },
        remove(name: string, options: any) {
          try { cookieStore.delete?.(name); } catch (_) {}
        },
      },
    }),
    cookieStore,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, cookieStore } = await getSupabase(request);

    // 1. Terminate Supabase Auth session on server
    try {
      await supabase.auth.signOut();
    } catch (authErr) {
      console.warn('Supabase auth.signOut warning:', authErr);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Signed out successfully.',
    });

    // 2. Clear all custom institutional cookies on response
    const cookiesToClear = [
      'readiness_role',
      'readiness_user_id',
      'readiness_onboarding_completed',
    ];

    cookiesToClear.forEach((name) => {
      response.cookies.set(name, '', {
        path: '/',
        maxAge: 0,
        expires: new Date(0),
        sameSite: 'lax',
      });
      try { cookieStore.delete?.(name); } catch (_) {}
    });

    // 3. Clear any Supabase auth cookies (all matching sb-*)
    const allCookies = typeof cookieStore.getAll === 'function' ? cookieStore.getAll() : request.cookies.getAll();
    allCookies.forEach((c: any) => {
      if (c.name.startsWith('sb-')) {
        response.cookies.set(c.name, '', {
          path: '/',
          maxAge: 0,
          expires: new Date(0),
        });
        try { cookieStore.delete?.(c.name); } catch (_) {}
      }
    });

    return response;
  } catch (err: any) {
    console.error('Sign out error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error during sign out' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Allow GET request for simple links or redirects
  return POST(request);
}
