'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { decks } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

// Define Zod schema for updating a deck
const updateDeckSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1, 'Title is required').max(256, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
});

// TypeScript type from Zod schema
type UpdateDeckInput = z.infer<typeof updateDeckSchema>;

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
