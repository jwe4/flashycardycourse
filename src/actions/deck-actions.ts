'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { decks, flashcards } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Define Zod schema for creating a deck
const createDeckSchema = z.object({
  title: z.string().min(1, 'Title is required').max(256, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
});

// Define Zod schema for updating a deck
const updateDeckSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1, 'Title is required').max(256, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
});

// TypeScript types from Zod schemas
type CreateDeckInput = z.infer<typeof createDeckSchema>;
type UpdateDeckInput = z.infer<typeof updateDeckSchema>;

export async function createDeck(input: CreateDeckInput) {
  try {
    // Authenticate user
    const { userId, has } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized - please sign in' };
    }

    // Enforce deck limit for free plan
    const canCreateUnlimited = has({ feature: 'unlimited_decks' });
    const hasDeckLimit = has({ feature: '3_deck_limit' });

    if (!canCreateUnlimited && hasDeckLimit) {
      const userDecks = await db.select().from(decks).where(eq(decks.userId, userId));
      if (userDecks.length >= 3) {
        return {
          success: false,
          error: 'Deck limit reached. Upgrade to Pro for unlimited decks.',
        };
      }
    }

    // Validate input with Zod
    const validatedData = createDeckSchema.parse(input);

    // Create the deck
    const [newDeck] = await db.insert(decks)
      .values({
        userId,
        title: validatedData.title,
        description: validatedData.description || null,
      })
      .returning();

    // Revalidate the dashboard to show the new deck
    revalidatePath('/dashboard');

    return { success: true, deck: newDeck };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Failed to create deck. Please try again.' };
  }
}

export async function updateDeck(input: UpdateDeckInput) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized - please sign in' };
    }

    // Validate input with Zod
    const validatedData = updateDeckSchema.parse(input);

    // Verify the deck exists and belongs to the user
    const [existingDeck] = await db.select()
      .from(decks)
      .where(and(
        eq(decks.id, validatedData.id),
        eq(decks.userId, userId)
      ))
      .limit(1);

    if (!existingDeck) {
      return { success: false, error: 'Deck not found or you do not have permission to edit it' };
    }

    // Update the deck
    const [updatedDeck] = await db.update(decks)
      .set({
        title: validatedData.title,
        description: validatedData.description || null,
        updatedAt: new Date(),
      })
      .where(eq(decks.id, validatedData.id))
      .returning();

    // Revalidate the deck page to show updated data
    revalidatePath(`/decks/${validatedData.id}`);
    revalidatePath('/dashboard');

    return { success: true, deck: updatedDeck };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Failed to update deck. Please try again.' };
  }
}

// Define Zod schema for deleting a deck
const deleteDeckSchema = z.object({
  id: z.number().int().positive(),
});

// TypeScript type from Zod schema
type DeleteDeckInput = z.infer<typeof deleteDeckSchema>;

export async function deleteDeck(input: DeleteDeckInput) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized - please sign in' };
    }

    // Validate input with Zod
    const validatedData = deleteDeckSchema.parse(input);

    // Verify the deck exists and belongs to the user
    const [existingDeck] = await db.select()
      .from(decks)
      .where(and(
        eq(decks.id, validatedData.id),
        eq(decks.userId, userId)
      ))
      .limit(1);

    if (!existingDeck) {
      return { success: false, error: 'Deck not found or you do not have permission to delete it' };
    }

    // Delete all flashcards associated with this deck first
    await db.delete(flashcards)
      .where(eq(flashcards.deckId, validatedData.id));

    // Delete the deck
    await db.delete(decks)
      .where(eq(decks.id, validatedData.id));

    // Revalidate the dashboard to reflect the deletion
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Failed to delete deck. Please try again.' };
  }
}
