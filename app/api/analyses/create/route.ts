import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { validateFileMagicBytes } from '@/server/parsing/magic-bytes';
import { extractPdfText } from '@/server/parsing/extract-pdf';
import { extractDocxText } from '@/server/parsing/extract-docx';
import { classifyResumeText } from '@/server/parsing/classify-resume';
import { sanitizeResumePII } from '@/server/parsing/sanitize-pii';
import { analyzeResumeContent } from '@/server/ai/engine';

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
      set(name: string, value: string, options: any) {
        cookieStore.set(name, value, options);
      },
      remove(name: string, options: any) {
        cookieStore.set(name, '', { ...options, maxAge: 0 });
      },
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File | null;
    const targetRoleId = (formData.get('targetRoleId') as string) || 'role_jfd';
    const dreamRole = (formData.get('dreamRole') as string) || 'Junior Frontend Developer';
    const dreamCompany = (formData.get('dreamCompany') as string) || 'Tier-1 Hiring Benchmark';
    const clientUserId = formData.get('userId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No resume file uploaded. Please upload a PDF or DOCX file.' }, { status: 400 });
    }

    // 1. File Size Check (Max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit. Please upload a smaller document.' },
        { status: 400 }
      );
    }

    // 2. Extension Check
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.pdf', '.docx'].includes(ext)) {
      return NextResponse.json(
        { error: 'Invalid file format. Please upload a PDF or DOCX file.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Magic Bytes Security Validation
    const magicValid = validateFileMagicBytes(buffer, ext);

    // 4. Real Text Extraction
    let rawText = '';
    let hasTextLayer = true;

    if (ext === '.pdf') {
      const parsed = await extractPdfText(buffer);
      rawText = parsed.text;
      hasTextLayer = parsed.hasTextLayer;
    } else {
      const parsed = await extractDocxText(buffer);
      rawText = parsed.text;
      hasTextLayer = parsed.hasTextLayer;
    }

    // Only reject on magic bytes if text extraction also completely failed
    if (!magicValid.valid && (!rawText || rawText.trim().length < 20)) {
      return NextResponse.json(
        { error: magicValid.reason || 'File header does not match declared extension. Please upload a genuine PDF or DOCX file.' },
        { status: 400 }
      );
    }

    if (!hasTextLayer || !rawText || rawText.trim().length < 20) {
      return NextResponse.json(
        { error: 'No readable text layer detected. Scanned documents or image-only PDFs are not supported. Please export as text-based PDF or DOCX.' },
        { status: 400 }
      );
    }

    // 5. Resume Classifier Check
    const classification = classifyResumeText(rawText);
    if (!classification.isResume && classification.confidence === 0.1) {
      return NextResponse.json(
        { error: classification.reason || 'The uploaded file does not appear to be a candidate resume.' },
        { status: 400 }
      );
    }

    // 6. PII Sanitization
    const { sanitizedText } = sanitizeResumePII(rawText);

    // 7. Resolve Effective User ID
    const supabase = await getSupabase();
    const cookieStore = await cookies();
    const cookieUserId = cookieStore.get('readiness_user_id')?.value;
    const { data: { user } } = await supabase.auth.getUser();

    const effectiveUserId = user?.id || clientUserId || cookieUserId || '36ac8503-c1c5-4865-b3f5-51c302a3e1ee';

    // Verify user exists in profiles or upsert
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, name, email')
      .eq('id', effectiveUserId)
      .single();

    if (!existingProfile) {
      // If user profile doesn't exist, create it to preserve FK constraints
      await supabase.from('profiles').upsert({
        id: effectiveUserId,
        email: user?.email || 'student@nie.ac.in',
        name: user?.user_metadata?.full_name || 'Student Candidate',
        role: 'student',
        onboarding_completed: true,
      });
    }

    const resumeId = 'res_' + Math.random().toString(36).substring(2, 9);
    const analysisId = 'ans_' + Math.random().toString(36).substring(2, 9);

    // 8. Store Resume Record
    const { error: resumeError } = await supabase.from('resumes').insert({
      id: resumeId,
      user_id: effectiveUserId,
      file_name: file.name,
      file_size: `${Math.round(file.size / 1024)} KB`,
      raw_text: sanitizedText,
      has_text_layer: true,
      is_resume: true,
    });

    if (resumeError) {
      console.warn('Resume insert warning:', resumeError);
    }

    // 9. Run AI Skill Matching & Gap Engine
    const analysisResult = analyzeResumeContent(
      sanitizedText,
      dreamRole,
      dreamCompany,
      existingProfile || {}
    );

    // 10. Store Analysis Record
    const { error: analysisError } = await supabase.from('analyses').insert({
      id: analysisId,
      user_id: effectiveUserId,
      resume_id: resumeId,
      target_role_id: targetRoleId,
      dream_role: dreamRole,
      dream_company: dreamCompany,
      status: 'done',
      readiness_score: analysisResult.readinessScore,
      confidence_score: analysisResult.confidenceScore,
      summary_sentence: analysisResult.summarySentence,
      top_gap: analysisResult.topGap,
      is_outstanding: analysisResult.readinessScore >= 85,
    });

    if (analysisError) {
      console.error('Analysis insert error:', analysisError);
      return NextResponse.json({ error: 'Failed to record analysis ledger: ' + analysisError.message }, { status: 500 });
    }

    // 11. Populate Analysis Items (Skill Matrix)
    const dbItems = analysisResult.competencies.map((comp) => ({
      id: comp.id,
      analysis_id: analysisId,
      name: comp.name,
      status: comp.status,
      status_label: comp.statusLabel,
      jd_requirement: comp.jdRequirement,
      evidence_quote: comp.evidenceQuote,
      source_reference: comp.sourceReference,
      plain_explanation: comp.plainExplanation,
    }));

    try {
      await supabase.from('analysis_items').insert(dbItems);
    } catch (e) {
      console.warn('Analysis items insert warning:', e);
    }

    // 12. Populate Roadmap Phases & Tasks
    const phaseMap: Record<string, string[]> = { prioritize: [], sequence: [], prove: [] };
    for (const task of analysisResult.roadmapTasks) {
      if (!phaseMap[task.phase]) phaseMap[task.phase] = [];
      phaseMap[task.phase].push(task.id);
    }

    try {
      const roadmapPhases = Object.entries(phaseMap)
        .filter(([, taskIds]) => taskIds.length > 0)
        .map(([phase]) => {
          const phaseTitle = phase === 'prioritize'
            ? `Phase 1: Critical Gap Remediation for ${dreamRole}`
            : phase === 'sequence'
              ? `Phase 2: Architectural Depth & Validation`
              : `Phase 3: Portfolio Proof & Deployment`;
          return {
            id: 'rmi_' + phase + '_' + Math.random().toString(36).substring(2, 7),
            analysis_id: analysisId,
            phase,
            title: phaseTitle,
            description: `Structured preparation tasks for ${dreamRole} at ${dreamCompany}`,
          };
        });

      await supabase.from('roadmap_items').insert(roadmapPhases);

      const dbTasks = analysisResult.roadmapTasks.map((task) => {
        const phaseItem = roadmapPhases.find((p) => p.phase === task.phase);
        return {
          id: task.id,
          roadmap_item_id: phaseItem?.id || roadmapPhases[0]?.id,
          analysis_id: analysisId,
          title: task.title,
          description: task.description,
          priority: task.priority,
          hours_estimate: task.hoursEstimate,
          evidence_outcome: task.evidenceOutcome,
          is_completed: false,
          due_date: task.dueDate,
          suggested_by_mentor: false,
        };
      });

      await supabase.from('roadmap_tasks').insert(dbTasks);
    } catch (e) {
      console.warn('Roadmap items insert warning:', e);
    }

    // 13. Set user id cookie for persistent session tracking
    const response = NextResponse.json({
      success: true,
      analysisId,
      readinessScore: analysisResult.readinessScore,
      dreamRole,
      dreamCompany,
      summarySentence: analysisResult.summarySentence,
    });

    response.cookies.set('readiness_user_id', effectiveUserId, {
      path: '/',
      maxAge: 30 * 86400,
      httpOnly: false,
      sameSite: 'lax',
    });

    return response;
  } catch (err: any) {
    console.error('Analyses create API error:', err);
    return NextResponse.json({ error: err.message || 'Server error during resume processing' }, { status: 500 });
  }
}
