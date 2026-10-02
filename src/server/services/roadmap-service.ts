import 'server-only';
import { can } from '../auth/permissions';
import { AppError } from './errors';
import { getRoadmapByAnalysisId, toggleTaskCompletion } from '../db/queries/roadmap';
import { getAnalysisById } from '../db/queries/analyses';
import { User, RoadmapItem, RoadmapTask } from '@/types';

export interface RoadmapProgressMetrics {
  totalTasks: number;
  completedTasks: number;
  progressPercent: number;
  totalHours: number;
  completedHours: number;
  nextBestAction: RoadmapTask | null;
}

export function computeProgressMetrics(tasks: RoadmapTask[]): RoadmapProgressMetrics {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.is_completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  let totalHours = 0;
  let completedHours = 0;

  for (const t of tasks) {
    const hrs = parseInt(t.hours_estimate?.replace(/[^0-9]/g, '') || '4', 10);
    totalHours += hrs;
    if (t.is_completed) completedHours += hrs;
  }

  const nextBestAction = tasks.find((t) => !t.is_completed) || null;

  return {
    totalTasks,
    completedTasks,
    progressPercent,
    totalHours,
    completedHours,
    nextBestAction,
  };
}

export async function getRoadmap(
  user: User,
  analysisId: string
): Promise<{ items: RoadmapItem[]; tasks: RoadmapTask[]; metrics: RoadmapProgressMetrics }> {
  const analysis = await getAnalysisById(analysisId);
  if (!analysis) {
    throw new AppError('NOT_FOUND', 'Analysis not found.', 404);
  }

  if (!can(user, 'view', 'roadmap', { user_id: analysis.user_id })) {
    throw new AppError('FORBIDDEN', 'Access denied to this action roadmap.', 403);
  }

  const { items, tasks } = await getRoadmapByAnalysisId(analysisId);
  const metrics = computeProgressMetrics(tasks);

  return { items, tasks, metrics };
}

export async function updateTaskStatus(
  user: User,
  taskId: string,
  analysisId: string,
  isCompleted: boolean
): Promise<{ success: boolean }> {
  const analysis = await getAnalysisById(analysisId);
  if (!analysis) {
    throw new AppError('NOT_FOUND', 'Analysis not found.', 404);
  }

  if (!can(user, 'update', 'roadmap', { user_id: analysis.user_id })) {
    throw new AppError('FORBIDDEN', 'You cannot modify tasks in this roadmap.', 403);
  }

  const success = await toggleTaskCompletion(taskId, isCompleted);
  return { success };
}
