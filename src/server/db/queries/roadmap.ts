import 'server-only';
import { supabase } from '../client';
import { RoadmapItem, RoadmapTask } from '@/types';

export async function getRoadmapByAnalysisId(analysisId: string): Promise<{ items: RoadmapItem[]; tasks: RoadmapTask[] }> {
  const { data: itemsData } = await supabase
    .from('roadmap_items')
    .select('*')
    .eq('analysis_id', analysisId)
    .order('created_at', { ascending: true });

  const { data: tasksData } = await supabase
    .from('roadmap_tasks')
    .select('*')
    .eq('analysis_id', analysisId)
    .order('created_at', { ascending: true });

  if (!itemsData || itemsData.length === 0 || !tasksData || tasksData.length === 0) {
    const defaultItems: RoadmapItem[] = [
      {
        id: 'item_phase_1',
        analysis_id: analysisId,
        phase: 'prioritize',
        title: 'Phase 1: Remediation & Telemetry (Weeks 1-2)',
        description: 'Close critical state management gaps and instrument observable action dispatch.',
      },
      {
        id: 'item_phase_2',
        analysis_id: analysisId,
        phase: 'sequence',
        title: 'Phase 2: Architectural Depth & Caching (Weeks 3-4)',
        description: 'Introduce query client cache layers, normalized stores, and optimistic updates.',
      },
      {
        id: 'item_phase_3',
        analysis_id: analysisId,
        phase: 'prove',
        title: 'Phase 3: Automated Proof & Placement Artifacts (Weeks 5-6)',
        description: 'Author unit test suites, integration tests, and live production deployments.',
      },
    ];

    const defaultTasks: RoadmapTask[] = [
      {
        id: 'task_01',
        roadmap_item_id: 'item_phase_1',
        analysis_id: analysisId,
        title: 'Refactor prop drilling to Zustand centralized store',
        description: 'Convert scattered component state into a single typed store with selector subscriptions.',
        priority: 'High',
        hours_estimate: '6 hrs',
        evidence_outcome: 'Git commit with centralized store architecture',
        is_completed: true,
      },
      {
        id: 'task_02',
        roadmap_item_id: 'item_phase_1',
        analysis_id: analysisId,
        title: 'Add Redux Toolkit query or React Query caching',
        description: 'Implement server cache invalidation and query deduplication.',
        priority: 'High',
        hours_estimate: '8 hrs',
        evidence_outcome: 'Network tab proof showing 0 redundant GET requests',
        is_completed: false,
      },
      {
        id: 'task_03',
        roadmap_item_id: 'item_phase_2',
        analysis_id: analysisId,
        title: 'Author 5 Vitest unit tests for reducer action edge-cases',
        description: 'Test async thunks, error handling, and state rollbacks.',
        priority: 'Medium',
        hours_estimate: '5 hrs',
        evidence_outcome: 'Test suite report with >85% branch coverage',
        is_completed: false,
      },
      {
        id: 'task_04',
        roadmap_item_id: 'item_phase_3',
        analysis_id: analysisId,
        title: 'Deploy benchmark full-stack project to Vercel with CI/CD',
        description: 'Configure automated GitHub Actions checking lint, build, and tests on push.',
        priority: 'Foundational',
        hours_estimate: '4 hrs',
        evidence_outcome: 'Passing GitHub workflow badge in repository README',
        is_completed: false,
      },
    ];

    return { items: defaultItems, tasks: defaultTasks };
  }

  return { items: itemsData as RoadmapItem[], tasks: tasksData as RoadmapTask[] };
}

export async function toggleTaskCompletion(taskId: string, isCompleted: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('roadmap_tasks')
    .update({ is_completed: isCompleted })
    .eq('id', taskId);

  return !error;
}
