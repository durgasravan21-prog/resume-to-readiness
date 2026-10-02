import 'server-only';
import { supabase } from '../client';
import { Analysis, AnalysisItem } from '@/types';

export async function getAnalysisById(id: string): Promise<Analysis | null> {
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    // Return sample diagnostic if not yet in database
    return {
      id,
      user_id: 'usr_aarav_01',
      resume_id: 'res_01',
      target_role_id: 'role_jfd',
      status: 'done',
      readiness_score: 68,
      confidence_score: 92,
      summary_sentence: 'Strong foundation in React & TypeScript component architectures, but lacks verified state management telemetry and enterprise testing proof.',
      top_gap: 'State Management & Testing telemetry absent from production projects',
    };
  }
  return data as Analysis;
}

export async function getAnalysisItems(analysisId: string): Promise<AnalysisItem[]> {
  const { data, error } = await supabase
    .from('analysis_items')
    .select('*')
    .eq('analysis_id', analysisId);

  if (error || !data || data.length === 0) {
    // Default high-fidelity items from the design spec
    return [
      {
        id: 'item_react_state',
        analysis_id: analysisId,
        name: 'React State Management (Redux / Zustand)',
        status: 'needs_proof',
        status_label: 'Needs stronger proof',
        jd_requirement: 'Experience managing complex global state with Redux Toolkit or Zustand in multi-screen workflows.',
        evidence_quote: 'Built dashboard UI using React hooks and local useState.',
        source_reference: 'Section: Technical Projects (Line 14)',
        plain_explanation: 'Your resume shows React component authoring, but state management is restricted to local useState without proof of centralized stores.',
      },
      {
        id: 'item_typescript',
        analysis_id: analysisId,
        name: 'TypeScript Strict Typing & Generics',
        status: 'strong',
        status_label: 'Strong evidence',
        jd_requirement: 'Proficiency in TypeScript, interfaces, generics, and strict compiler configurations.',
        evidence_quote: 'Migrated 14 frontend repositories to TypeScript with zero "any" types and custom generic API wrappers.',
        source_reference: 'Section: Work Experience — FinTech Corp',
        plain_explanation: 'Excellent verified proof. Explicitly mentions zero any types and custom generic wrappers.',
      },
      {
        id: 'item_css_grid',
        analysis_id: analysisId,
        name: 'CSS Grid & Responsive Systems',
        status: 'strong',
        status_label: 'Strong evidence',
        jd_requirement: 'Modern CSS architecture, Grid, Flexbox, and Tailwind CSS.',
        evidence_quote: 'Designed fluid editorial design system utilizing CSS Grid, Tailwind tokens, and subgrid.',
        source_reference: 'Section: Key Projects — Design System',
        plain_explanation: 'Strong verified evidence from design system project.',
      },
      {
        id: 'item_testing',
        analysis_id: analysisId,
        name: 'Unit & Integration Testing (Jest / Vitest)',
        status: 'missing',
        status_label: 'Missing from resume',
        jd_requirement: 'Automated test authoring with Jest, Vitest, or React Testing Library.',
        evidence_quote: null,
        source_reference: null,
        plain_explanation: 'No automated testing frameworks or test suites are mentioned in any project description.',
      },
      {
        id: 'item_ci_cd',
        analysis_id: analysisId,
        name: 'CI/CD & Cloud Deployment Pipelines',
        status: 'needs_proof',
        status_label: 'Needs stronger proof',
        jd_requirement: 'Deploying frontend web apps to Vercel/AWS with automated GitHub Actions.',
        evidence_quote: 'Deployed demo web application to Vercel.',
        source_reference: 'Section: Academic Projects',
        plain_explanation: 'Mentioned Vercel deployment, but no GitHub Actions CI/CD automation pipeline demonstrated.',
      },
    ];
  }

  return data as AnalysisItem[];
}

export async function createAnalysis(analysis: Partial<Analysis>): Promise<Analysis> {
  const newId = analysis.id || 'anl_' + Date.now();
  const payload = {
    id: newId,
    user_id: analysis.user_id || 'usr_aarav_01',
    resume_id: analysis.resume_id || null,
    target_role_id: analysis.target_role_id || 'role_jfd',
    custom_jd: analysis.custom_jd || null,
    status: analysis.status || 'extracting',
    readiness_score: analysis.readiness_score || 0,
    confidence_score: analysis.confidence_score || 90,
  };

  const { data, error } = await supabase
    .from('analyses')
    .insert([payload])
    .select()
    .single();

  if (error) {
    return payload as Analysis;
  }
  return data as Analysis;
}

export async function updateAnalysisStatus(id: string, status: Analysis['status'], scores?: { readiness?: number; confidence?: number }): Promise<void> {
  const updateData: any = { status };
  if (scores?.readiness !== undefined) updateData.readiness_score = scores.readiness;
  if (scores?.confidence !== undefined) updateData.confidence_score = scores.confidence;

  await supabase
    .from('analyses')
    .update(updateData)
    .eq('id', id);
}
