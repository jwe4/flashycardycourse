'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { flashcards, decks } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export async function createFlashcard(input: CreateFlashcardInput) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized - please sign in' };
    }

    // Validate input with Zod
    const validatedData = createFlashcardSchema.parse(input);

    // Verify the user owns the deck
    const [deck] = await db.select()
      .from(decks)
      .where(and(
        eq(decks.id, validatedData.deckId),
        eq(decks.userId, userId)
      ))
      .limit(1);

    if (!deck) {
      return { success: false, error: 'You do not have permission to add flashcards to this deck' };
    }

    // Create the flashcard
    const [newCard] = await db.insert(flashcards)
      .values({
        deckId: validatedData.deckId,
        front: validatedData.front,
        back: validatedData.back,
      })
      .returning();

    // Revalidate the deck page to show new data
    revalidatePath(`/decks/${validatedData.deckId}`);

    return { success: true, flashcard: newCard };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Failed to create flashcard. Please try again.' };
  }
}

// Define Zod schema for creating a flashcard
const createFlashcardSchema = z.object({
  deckId: z.number().int().positive(),
  front: z.string().min(1, 'Front content is required'),
  back: z.string().min(1, 'Back content is required'),
});

// TypeScript type from Zod schema
type CreateFlashcardInput = z.infer<typeof createFlashcardSchema>;

// Define Zod schema for updating a flashcard
const updateFlashcardSchema = z.object({
  id: z.number().int().positive(),
  front: z.string().min(1, 'Front content is required'),
  back: z.string().min(1, 'Back content is required'),
});

// TypeScript type from Zod schema
type UpdateFlashcardInput = z.infer<typeof updateFlashcardSchema>;

export async function updateFlashcard(input: UpdateFlashcardInput) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized - please sign in' };
    }

    // Validate input with Zod
    const validatedData = updateFlashcardSchema.parse(input);

    // Verify the flashcard exists and the user owns the parent deck
    const [existingCard] = await db.select()
      .from(flashcards)
      .where(eq(flashcards.id, validatedData.id))
      .limit(1);

    if (!existingCard) {
      return { success: false, error: 'Flashcard not found' };
    }

    // Verify the user owns the deck
    const [deck] = await db.select()
      .from(decks)
      .where(and(
        eq(decks.id, existingCard.deckId),
        eq(decks.userId, userId)
      ))
      .limit(1);

    if (!deck) {
      return { success: false, error: 'You do not have permission to edit this flashcard' };
    }

    // Update the flashcard
    const [updatedCard] = await db.update(flashcards)
      .set({
        front: validatedData.front,
        back: validatedData.back,
        updatedAt: new Date(),
      })
      .where(eq(flashcards.id, validatedData.id))
      .returning();

    // Revalidate the deck page to show updated data
    revalidatePath(`/decks/${existingCard.deckId}`);

    return { success: true, flashcard: updatedCard };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Failed to update flashcard. Please try again.' };
  }
}

// Define Zod schema for deleting a flashcard
const deleteFlashcardSchema = z.object({
  id: z.number().int().positive(),
});

// TypeScript type from Zod schema
type DeleteFlashcardInput = z.infer<typeof deleteFlashcardSchema>;

export async function deleteFlashcard(input: DeleteFlashcardInput) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized - please sign in' };
    }

    // Validate input with Zod
    const validatedData = deleteFlashcardSchema.parse(input);

    // Verify the flashcard exists and the user owns the parent deck
    const [existingCard] = await db.select()
      .from(flashcards)
      .where(eq(flashcards.id, validatedData.id))
      .limit(1);

    if (!existingCard) {
      return { success: false, error: 'Flashcard not found' };
    }

    // Verify the user owns the deck
    const [deck] = await db.select()
      .from(decks)
      .where(and(
        eq(decks.id, existingCard.deckId),
        eq(decks.userId, userId)
      ))
      .limit(1);

    if (!deck) {
      return { success: false, error: 'You do not have permission to delete this flashcard' };
    }

    // Delete the flashcard
    await db.delete(flashcards)
      .where(eq(flashcards.id, validatedData.id));

    // Revalidate the deck page to show updated data
    revalidatePath(`/decks/${existingCard.deckId}`);

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Failed to delete flashcard. Please try again.' };
  }
}
