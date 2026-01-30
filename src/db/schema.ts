import { pgTable, serial, text, timestamp, varchar, integer } from 'drizzle-orm/pg-core';

// Decks table - each user can create multiple decks
export const decks = pgTable('decks', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 256 }).notNull(), // Clerk user ID
  title: varchar('title', { length: 256 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Flashcards table - each deck has multiple flashcards
export const flashcards = pgTable('flashcards', {
  id: serial('id').primaryKey(),
  deckId: integer('deck_id').notNull().references(() => decks.id, { onDelete: 'cascade' }),
  front: text('front').notNull(), // e.g., "Dog" or "When was the battle of hastings?"
  back: text('back').notNull(), // e.g., "Anjing" or "1066"
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
