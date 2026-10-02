import { text, timestamp } from 'drizzle-orm/pg-core';
import { readinessSchema, colleges } from './colleges';

export const users = readinessSchema.table('users', {
  id: text('id').primaryKey(),
  collegeId: text('college_id').references(() => colleges.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role').notNull(), // 'student' | 'coordinator' | 'admin'
  rollNumber: text('roll_number'),
  degree: text('degree'),
  branch: text('branch'),
  graduationYear: text('graduation_year'),
  cgpa: text('cgpa'),
  school10th: text('school_10th'),
  school10thMarks: text('school_10th_marks'),
  school12th: text('school_12th'),
  school12thMarks: text('school_12th_marks'),
  collegeName: text('college_name'),
  achievementsText: text('achievements_text'),
  achievements: text('achievements').array(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export type DbUser = typeof users.$inferSelect;
export type NewDbUser = typeof users.$inferInsert;
