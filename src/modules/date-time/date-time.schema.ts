import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const dateTimeEvents = pgTable('date_time_events', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
  sourceTimezone: varchar('source_timezone', { length: 64 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
