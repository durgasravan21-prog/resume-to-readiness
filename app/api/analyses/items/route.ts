import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getSupabase() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yslupcclthqltvvwjvjr.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbHVwY2NsdGhxbHR2dndqdmpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MjA0MzYsImV4cCI6MjA5ODk5NjQzNn0.XN9oa1bOtXf0ZsqViLDk5OB_xVT-wFh7GPDEFzzgtPU';

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  });
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, analysisId, status, statusLabel, plainExplanation } = body;

    if (!itemId) {
      return NextResponse.json({ error: 'Missing itemId.' }, { status: 400 });
    }

    const supabase = await getSupabase();

    const updateFields: any = {};
    if (status) {
      updateFields.status = status;
      updateFields.status_label = statusLabel || (
        status === 'strong' ? 'Strong Evidence' :
        status === 'proof' || status === 'needs_proof' ? 'Needs Stronger Proof' :
        'Critical Skill Gap'
      );
    }
    if (plainExplanation !== undefined) {
      updateFields.plain_explanation = plainExplanation;
    }

    // 1. Update the competency item
    const { data: updatedItem, error: itemError } = await supabase
      .from('analysis_items')
      .update(updateFields)
      .eq('id', itemId)
      .select()
      .single();

    if (itemError) {
      console.error('Error updating competency item:', itemError);
      return NextResponse.json({ error: itemError.message }, { status: 500 });
    }

    // 2. Recalculate student readiness score if analysisId is provided
    let newReadinessScore: number | null = null;
    const effectiveAnalysisId = analysisId || updatedItem?.analysis_id;

    if (effectiveAnalysisId) {
      const { data: allItems } = await supabase
        .from('analysis_items')
        .select('status')
        .eq('analysis_id', effectiveAnalysisId);

      if (allItems && allItems.length > 0) {
        const strongCount = allItems.filter((i) => i.status === 'strong').length;
        const proofCount = allItems.filter((i) => i.status === 'proof' || i.status === 'needs_proof').length;
        // Strong counts 100%, Needs proof counts 60%, Gap counts 20%
        const score = Math.round(((strongCount * 1.0 + proofCount * 0.6) / allItems.length) * 100);
        newReadinessScore = Math.min(98, Math.max(25, score));

        await supabase
          .from('analyses')
          .update({ readiness_score: newReadinessScore })
          .eq('id', effectiveAnalysisId);
      }
    }

    return NextResponse.json({
      success: true,
      item: updatedItem,
      newReadinessScore,
    });
  } catch (err: any) {
    console.error('Item update error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
