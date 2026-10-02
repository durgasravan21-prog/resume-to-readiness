import { text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { readinessSchema } from './colleges';
import { users } from './users';

export const auditLog = readinessSchema.table('audit_log', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  targetId: text('target_id'),
  details: jsonb('details').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export type DbAuditLog = typeof auditLog.$inferSelect;
export type NewDbAuditLog = typeof auditLog.$inferInsert;
