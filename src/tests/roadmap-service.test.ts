import { describe, it, expect } from 'vitest';
import { computeProgressMetrics } from '../server/services/roadmap-service';
import { RoadmapTask } from '@/types';

describe('computeProgressMetrics', () => {
  it('correctly calculates completed tasks percentage and hours', () => {
    const tasks: RoadmapTask[] = [
      {
        id: 't1',
        roadmap_item_id: 'i1',
        analysis_id: 'a1',
        title: 'Task 1',
        priority: 'High',
        hours_estimate: '6 hrs',
        is_completed: true,
      },
      {
        id: 't2',
        roadmap_item_id: 'i1',
        analysis_id: 'a1',
        title: 'Task 2',
        priority: 'High',
        hours_estimate: '4 hrs',
        is_completed: false,
      },
    ];

    const metrics = computeProgressMetrics(tasks);
    expect(metrics.totalTasks).toBe(2);
    expect(metrics.completedTasks).toBe(1);
    expect(metrics.progressPercent).toBe(50);
    expect(metrics.totalHours).toBe(10);
    expect(metrics.completedHours).toBe(6);
    expect(metrics.nextBestAction?.id).toBe('t2');
  });

  it('handles empty task list without division by zero', () => {
    const metrics = computeProgressMetrics([]);
    expect(metrics.totalTasks).toBe(0);
    expect(metrics.progressPercent).toBe(0);
    expect(metrics.nextBestAction).toBeNull();
  });
});
