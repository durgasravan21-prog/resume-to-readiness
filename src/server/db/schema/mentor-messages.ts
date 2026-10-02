import { text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { readinessSchema } from './colleges';
import { analyses } from './analyses';
import { users } from './users';

export const mentorMessages = readinessSchema.table('mentor_messages', {
  id: text('id').primaryKey(),
  analysisId: text('analysis_id').notNull().references(() => analyses.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sender: text('sender').notNull(), // 'student' | 'mentor'
  senderName: text('sender_name').notNull(),
  messageText: text('message_text').notNull(),
  actionCardJson: jsonb('action_card_json'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export type DbMentorMessage = typeof mentorMessages.$inferSelect;
export type NewDbMentorMessage = typeof mentorMessages.$inferInsert;
