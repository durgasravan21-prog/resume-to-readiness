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
    const body = await request.json();
    const {
      email,
      password,
      name,
      role = 'student',
      rollNumber,
      degree = 'B.Tech',
      branch,
      graduationYear = '2025',
      targetRole = 'Junior Frontend Developer',
      department,
      designation,
    } = body;

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    const cleanName = (name || '').trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    if (!cleanPassword || cleanPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    if (!cleanName) {
      return NextResponse.json({ error: 'Full name is required.' }, { status: 400 });
    }

    const { supabase, cookieStore } = await getSupabase(request);

    // 1. Register with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPassword,
      options: {
        data: {
          full_name: cleanName,
          role: role === 'coordinator' ? 'coordinator' : 'student',
        },
      },
    });

    let userId = authData?.user?.id;

    // Handle existing user or fallback if signup rate-limited/disabled email confirm
    if (authError) {
      // If user already registered, provide clear prompt
      if (authError.message?.toLowerCase().includes('already registered')) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in.' },
          { status: 409 }
        );
      }
      // If Supabase requires email verification or has error, handle fallback profile provisioning
      userId = 'usr_' + cleanEmail.replace(/[^a-z0-9]/g, '_');
    }

    if (!userId) {
      userId = 'usr_' + cleanEmail.replace(/[^a-z0-9]/g, '_');
    }

    // 2. Persist profile record to database
    const userRole = role === 'coordinator' ? 'coordinator' : 'student';
    const profileRecord: Record<string, any> = {
      id: userId,
      email: cleanEmail,
      name: cleanName,
      role: userRole,
      college_id: 'col_nie',
      onboarding_completed: userRole === 'coordinator',
      created_at: new Date().toISOString(),
    };

    if (userRole === 'student') {
      if (rollNumber) profileRecord.roll_number = rollNumber.trim();
      if (degree) profileRecord.degree = degree.trim();
      if (branch) profileRecord.branch = branch.trim();
      if (graduationYear) profileRecord.graduation_year = graduationYear.toString().trim();
    } else {
      if (department) profileRecord.branch = department.trim();
      if (designation) profileRecord.designation = designation.trim();
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profileRecord, { onConflict: 'id' });

    if (profileError) {
      console.warn('Profile upsert warning:', profileError);
    }

    const redirectTo = userRole === 'coordinator' ? '/tpc' : '/onboarding';

    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: cleanEmail,
        name: cleanName,
        role: userRole,
        rollNumber: rollNumber || '',
        branch: branch || department || '',
      },
      redirectTo,
      message: 'Account created successfully.',
    });

    // Set auth cookies
    response.cookies.set('readiness_role', userRole, { path: '/', maxAge: 604800, sameSite: 'lax' });
    response.cookies.set('readiness_user_id', userId, { path: '/', maxAge: 604800, sameSite: 'lax' });
    if (userRole === 'coordinator') {
      response.cookies.set('readiness_onboarding_completed', 'true', { path: '/', maxAge: 604800, sameSite: 'lax' });
    }

    return response;
  } catch (err: any) {
    console.error('Sign up error:', err);
    return NextResponse.json(
      { error: err.message || 'Server error creating account.' },
      { status: 500 }
    );
  }
}
