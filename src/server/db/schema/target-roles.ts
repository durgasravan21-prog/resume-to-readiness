import { text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import { readinessSchema, colleges } from './colleges';

export const targetRoles = readinessSchema.table('target_roles', {
  id: text('id').primaryKey(),
  collegeId: text('college_id').references(() => colleges.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  category: text('category').notNull(),
  companies: text('companies'),
  description: text('description'),
  benchmarkCode: text('benchmark_code'),
  skills: text('skills').array().default([]),
  syllabusJson: jsonb('syllabus_json').default({}),
  minCgpa: text('min_cgpa'),
  createdBy: text('created_by'),
  censusCount: integer('census_count').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export type DbTargetRole = typeof targetRoles.$inferSelect;
export type NewDbTargetRole = typeof targetRoles.$inferInsert;
