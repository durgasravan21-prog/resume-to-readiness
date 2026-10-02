import { text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { readinessSchema } from './colleges';
import { users } from './users';

export const resumes = readinessSchema.table('resumes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  fileSize: text('file_size').notNull(),
  fileUrl: text('file_url'),
  rawText: text('raw_text'),
  hasTextLayer: boolean('has_text_layer').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export type DbResume = typeof resumes.$inferSelect;
export type NewDbResume = typeof resumes.$inferInsert;
