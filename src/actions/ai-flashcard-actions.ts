'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { flashcards, decks } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { generateText, Output } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

const generateAIFlashcardsSchema = z.object({
  deckId: z.number().int().positive(),
});

type GenerateAIFlashcardsInput = z.infer<typeof generateAIFlashcardsSchema>;

export async function generateAIFlashcards(input: GenerateAIFlashcardsInput) {
  try {
    const { userId, has } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized - please sign in' };
    }

    if (!has({ feature: 'ai_flashcard_generation' })) {
      return {
        success: false,
        error: 'AI flashcard generation requires a Pro subscription.',
      };
    }

    const validatedData = generateAIFlashcardsSchema.parse(input);

    const [deck] = await db
      .select()
      .from(decks)
      .where(
        and(
          eq(decks.id, validatedData.deckId),
          eq(decks.userId, userId)
        )
      )
      .limit(1);

    if (!deck) {
      return {
        success: false,
        error: 'You do not have permission to add flashcards to this deck',
      };
    }

    const trimmedDescription = deck.description?.trim();
    if (!trimmedDescription) {
      return {
        success: false,
        error: 'Please add a description to your deck before generating flashcards with AI. The description helps the AI understand what topics to cover.',
      };
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        error: 'OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment.',
      };
    }

    const topic = deck.title;
    const context = `Topic: ${topic}. Additional context: ${trimmedDescription}`;

    const openaiProvider = createOpenAI({ apiKey });

    const { output } = await generateText({
      model: openaiProvider('gpt-4o'),
      output: Output.array({
        element: z.object({
          front: z
            .string()
            .describe('The question or term on the front of the card'),
          back: z
            .string()
            .describe('The answer or definition on the back of the card'),
        }),
        name: 'Flashcards',
        description:
          'An array of flashcards with front and back content',
      }),
      prompt: `Generate exactly 20 flashcards about: ${context}. Each card must have a front (question or term) and back (answer or definition). Create diverse, educational flashcards that cover the topic thoroughly.`,
    });

    if (!output || output.length === 0) {
      return {
        success: false,
        error: 'No flashcards were generated. Please try again.',
      };
    }

    const values = output.map((card) => ({
      deckId: validatedData.deckId,
      front: card.front.trim(),
      back: card.back.trim(),
    }));

    await db.insert(flashcards).values(values);

    revalidatePath(`/decks/${validatedData.deckId}`);

    return {
      success: true,
      count: values.length,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error('AI flashcard generation error:', error);
    return {
      success: false,
      error: 'Failed to generate flashcards. Please try again.',
    };
  }
}
