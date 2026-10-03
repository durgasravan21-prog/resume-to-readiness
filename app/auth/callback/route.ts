import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/home';

  if (code) {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yslupcclthqltvvwjvjr.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbHVwY2NsdGhxbHR2dndqdmpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MjA0MzYsImV4cCI6MjA5ODk5NjQzNn0.XN9oa1bOtXf0ZsqViLDk5OB_xVT-wFh7GPDEFzzgtPU';

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      db: { schema: 'readiness' },
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options) {
          cookieStore.delete({ name, ...options });
        },
      },
    });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const user = data.user;

      // Look up profile in readiness.profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile) {
        // Auto-provision initial student profile
        await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student',
          role: 'student',
          onboarding_completed: false,
          avatar_url: user.user_metadata?.avatar_url,
          college_id: 'col_nie',
        });
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      if (profile.onboarding_completed || user.email === 'durgasravan21@gmail.com') {
        cookieStore.set('readiness_onboarding_completed', 'true', { path: '/', maxAge: 604800, sameSite: 'lax' });
      }

      if (!profile.onboarding_completed && profile.role === 'student' && user.email !== 'durgasravan21@gmail.com') {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      if (profile.role === 'coordinator') {
        return NextResponse.redirect(`${origin}/tpc`);
      }
      if (profile.role === 'mentor') {
        return NextResponse.redirect(`${origin}/mentor`);
      }
      if (profile.role === 'admin' || user.email === 'durgasravan21@gmail.com') {
        return NextResponse.redirect(`${origin}/home`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return to root with error code
  return NextResponse.redirect(`${origin}/?error=auth_failed`);
}
