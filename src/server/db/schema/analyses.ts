import { text, timestamp, integer } from 'drizzle-orm/pg-core';
import { readinessSchema } from './colleges';
import { users } from './users';
import { resumes } from './resumes';
import { targetRoles } from './target-roles';

export const analyses = readinessSchema.table('analyses', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  resumeId: text('resume_id').references(() => resumes.id, { onDelete: 'set null' }),
  targetRoleId: text('target_role_id').references(() => targetRoles.id, { onDelete: 'set null' }),
  customJd: text('custom_jd'),
  status: text('status').notNull(), // 'queued' | 'extracting' | 'reading_role' | 'matching' | 'explaining' | 'done' | 'failed'
  readinessScore: integer('readiness_score').default(0),
  confidenceScore: integer('confidence_score').default(0),
  summarySentence: text('summary_sentence'),
  topGap: text('top_gap'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export type DbAnalysis = typeof analyses.$inferSelect;
export type NewDbAnalysis = typeof analyses.$inferInsert;
