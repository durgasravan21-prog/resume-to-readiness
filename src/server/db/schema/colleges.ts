import { pgSchema, text, timestamp } from 'drizzle-orm/pg-core';

export const readinessSchema = pgSchema('readiness');

export const colleges = readinessSchema.table('colleges', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  domain: text('domain').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export type College = typeof colleges.$inferSelect;
export type NewCollege = typeof colleges.$inferInsert;
