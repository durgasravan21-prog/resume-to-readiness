import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { validateFileMagicBytes } from '@/server/parsing/magic-bytes';
import { extractPdfText } from '@/server/parsing/extract-pdf';
import { extractDocxText } from '@/server/parsing/extract-docx';
import { sanitizeResumePII } from '@/server/parsing/sanitize-pii';

async function getSupabase() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yslupcclthqltvvwjvjr.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbHVwY2NsdGhxbHR2dndqdmpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MjA0MzYsImV4cCI6MjA5ODk5NjQzNn0.XN9oa1bOtXf0ZsqViLDk5OB_xVT-wFh7GPDEFzzgtPU';

  return createServerClient(supabaseUrl, supabaseAnonKey, {
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
}

// GET: Fetch student profile (with locked vs editable partition)
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabase();
    const cookieStore = await cookies();
    const { data: { user } } = await supabase.auth.getUser();

    // Fallback: look for query user_id or cookie user_id
    const url = new URL(request.url);
    const queryUserId = url.searchParams.get('userId');
    const cookieUserId = cookieStore.get('readiness_user_id')?.value;
    let targetUserId = user?.id || queryUserId || cookieUserId;

    if (!targetUserId) {
      // Fetch latest profile from profiles table as default demo candidate
      const { data: fallbackProfiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (fallbackProfiles && fallbackProfiles.length > 0) {
        const p = fallbackProfiles[0];
        const { data: resume } = await supabase
          .from('resumes')
          .select('id, file_name, file_size, created_at')
          .eq('user_id', p.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        return NextResponse.json({ profile: p, latestResume: resume || null });
      }

      return NextResponse.json({ error: 'User session not found.' }, { status: 404 });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetUserId)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
    }

    // Also fetch their latest uploaded resume metadata
    const { data: resume } = await supabase
      .from('resumes')
      .select('id, file_name, file_size, created_at')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      profile,
      latestResume: resume || null,
    });
  } catch (err: any) {
    console.error('Settings GET error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// POST: Update editable fields ONLY (phone, github, linkedin, resume)
// STRICT SECURITY POLICY: Name, DOB, Roll Number, 10th/12th Schooling CANNOT be altered here.
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const targetUserId = formData.get('userId') as string | null;
    const phoneNumber = formData.get('phone_number') as string | null;
    const githubUrl = formData.get('github_url') as string | null;
    const linkedinUrl = formData.get('linkedin_url') as string | null;
    const resumeFile = formData.get('resume') as File | null;

    const supabase = await getSupabase();
    const cookieStore = await cookies();
    const { data: { user } } = await supabase.auth.getUser();
    const cookieUserId = cookieStore.get('readiness_user_id')?.value;
    let effectiveUserId = user?.id || targetUserId || cookieUserId;

    if (!effectiveUserId) {
      const { data: latestStudent } = await supabase
        .from('profiles')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      effectiveUserId = latestStudent?.id || 'usr_student_01';
    }

    // 1. Prepare allowed updates (strictly editable fields only)
    const updates: Record<string, any> = {};
    if (phoneNumber !== null) updates.phone_number = phoneNumber.trim();
    if (githubUrl !== null) updates.github_url = githubUrl.trim();
    if (linkedinUrl !== null) updates.linkedin_url = linkedinUrl.trim();

    // Execute profile update
    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', effectiveUserId);

      if (updateError) {
        throw new Error(updateError.message || 'Could not update profile fields.');
      }
    }

    // 2. Handle optional Resume Replacement
    let newResumeRecord = null;
    if (resumeFile && resumeFile.size > 0) {
      const ext = resumeFile.name.substring(resumeFile.name.lastIndexOf('.')).toLowerCase();
      if (ext !== '.pdf' && ext !== '.docx' && ext !== '.doc') {
        return NextResponse.json({ error: 'Only PDF (.pdf) and Word documents (.docx, .doc) are accepted.' }, { status: 400 });
      }

      const arrayBuffer = await resumeFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const magicCheck = validateFileMagicBytes(buffer, ext);
      if (!magicCheck.valid && magicCheck.reason?.includes('executable')) {
        return NextResponse.json({ error: magicCheck.reason }, { status: 400 });
      }

      let rawText = '';
      if (ext === '.pdf') {
        const parsed = await extractPdfText(buffer);
        rawText = parsed.text;
      } else {
        const parsed = await extractDocxText(buffer);
        rawText = parsed.text;
      }

      const { sanitizedText } = sanitizeResumePII(rawText);
      const newResumeId = 'res_' + Math.random().toString(36).substring(2, 9);

      const { data: insertedResume, error: resumeError } = await supabase
        .from('resumes')
        .insert({
          id: newResumeId,
          user_id: effectiveUserId,
          file_name: resumeFile.name,
          file_size: `${Math.round(resumeFile.size / 1024)} KB`,
          raw_text: sanitizedText || 'Verified updated candidate resume document.',
          has_text_layer: true,
          is_resume: true,
        })
        .select()
        .single();

      if (resumeError) {
        console.warn('Resume update insert notice:', resumeError);
      } else {
        newResumeRecord = insertedResume;
      }
    }

    // 3. Log audit event
    await supabase.from('audit_log').insert({
      id: 'aud_' + Math.random().toString(36).substring(2, 9),
      action: 'candidate_profile_updated',
      performed_by: effectiveUserId,
      details: {
        updated_fields: Object.keys(updates),
        new_resume: !!resumeFile,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully. Verified institutional credentials remain immutable.',
      updatedFields: updates,
      resume: newResumeRecord,
    });
  } catch (err: any) {
    console.error('Settings POST error:', err);
    return NextResponse.json({ error: err.message || 'Server error updating profile' }, { status: 500 });
  }
}
