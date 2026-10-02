import { text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { readinessSchema } from './colleges';
import { analyses } from './analyses';

export const roadmapItems = readinessSchema.table('roadmap_items', {
  id: text('id').primaryKey(),
  analysisId: text('analysis_id').notNull().references(() => analyses.id, { onDelete: 'cascade' }),
  phase: text('phase').notNull(), // 'prioritize' | 'sequence' | 'prove'
  title: text('title').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const roadmapTasks = readinessSchema.table('roadmap_tasks', {
  id: text('id').primaryKey(),
  roadmapItemId: text('roadmap_item_id').notNull().references(() => roadmapItems.id, { onDelete: 'cascade' }),
  analysisId: text('analysis_id').notNull().references(() => analyses.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  priority: text('priority').notNull(), // 'High' | 'Medium' | 'Foundational'
  hoursEstimate: text('hours_estimate'),
  evidenceOutcome: text('evidence_outcome'),
  isCompleted: boolean('is_completed').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export type DbRoadmapItem = typeof roadmapItems.$inferSelect;
export type DbRoadmapTask = typeof roadmapTasks.$inferSelect;
export type NewDbRoadmapTask = typeof roadmapTasks.$inferInsert;
