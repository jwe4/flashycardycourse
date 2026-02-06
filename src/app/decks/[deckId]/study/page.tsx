import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { decks, flashcards } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { StudyInterface } from './study-interface';

interface StudyPageProps {
  params: Promise<{
    deckId: string;
  }>;
}

export default async function StudyPage({ params }: StudyPageProps) {
  // Authenticate user
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/');
  }

  // Get the deckId from params
  const { deckId } = await params;
  const deckIdNumber = parseInt(deckId, 10);

  if (isNaN(deckIdNumber)) {
    notFound();
  }

  // Fetch the deck and verify ownership
  const [deck] = await db.select()
    .from(decks)
    .where(and(
      eq(decks.id, deckIdNumber),
      eq(decks.userId, userId)
    ))
    .limit(1);

  if (!deck) {
    notFound();
  }

  // Fetch all flashcards for this deck
  const deckFlashcards = await db.select()
    .from(flashcards)
    .where(eq(flashcards.deckId, deckIdNumber));

  // If no flashcards, redirect back to deck page
  if (deckFlashcards.length === 0) {
    redirect(`/decks/${deckIdNumber}`);
  }

  return (
    <StudyInterface 
      deck={deck}
      flashcards={deckFlashcards}
      deckId={deckIdNumber}
    />
  );
}
