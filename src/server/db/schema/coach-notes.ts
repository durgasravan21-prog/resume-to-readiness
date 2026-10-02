import { text, timestamp } from 'drizzle-orm/pg-core';
import { readinessSchema } from './colleges';
import { users } from './users';

export const coachNotes = readinessSchema.table('coach_notes', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  coordinatorId: text('coordinator_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  noteText: text('note_text').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export type DbCoachNote = typeof coachNotes.$inferSelect;
export type NewDbCoachNote = typeof coachNotes.$inferInsert;
