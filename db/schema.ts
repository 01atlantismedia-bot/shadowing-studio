import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';
export const takes = pgTable('takes', {
 id: uuid().primaryKey(), owner: text().notNull(), video: text().notNull(),
 phrase: text().notNull(), mime: text().notNull(), rating: integer(),
 createdAt: timestamp('created_at').defaultNow().notNull()
});
