import { text, timestamp } from 'drizzle-orm/pg-core';
import { readinessSchema } from './colleges';
import { analyses } from './analyses';

export const analysisItems = readinessSchema.table('analysis_items', {
  id: text('id').primaryKey(),
  analysisId: text('analysis_id').notNull().references(() => analyses.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  status: text('status').notNull(), // 'strong' | 'needs_proof' | 'missing'
  statusLabel: text('status_label'),
  jdRequirement: text('jd_requirement'),
  evidenceQuote: text('evidence_quote'),
  sourceReference: text('source_reference'),
  plainExplanation: text('plain_explanation'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export type DbAnalysisItem = typeof analysisItems.$inferSelect;
export type NewDbAnalysisItem = typeof analysisItems.$inferInsert;
