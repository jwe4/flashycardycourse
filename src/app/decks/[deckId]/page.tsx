import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { decks, flashcards } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EditDeckDialog } from '@/components/edit-deck-dialog';
import { EditFlashcardDialog } from '@/components/edit-flashcard-dialog';
import { AddFlashcardDialog } from '@/components/add-flashcard-dialog';
import { DeleteFlashcardDialog } from '@/components/delete-flashcard-dialog';

interface DeckPageProps {
  params: Promise<{
    deckId: string;
  }>;
}

export default async function DeckPage({ params }: DeckPageProps) {
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

  // Fetch all flashcards for this deck, sorted by most recently updated
  const deckFlashcards = await db.select()
    .from(flashcards)
    .where(eq(flashcards.deckId, deckIdNumber))
    .orderBy(desc(flashcards.updatedAt));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header with back button and actions */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
                {deck.title}
              </h1>
              {deck.description && (
                <p className="text-muted-foreground text-lg mb-4">
                  {deck.description}
                </p>
              )}
              <div className="flex items-center gap-3">
                <Badge variant="secondary">
                  {deckFlashcards.length} {deckFlashcards.length === 1 ? 'card' : 'cards'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Created {new Date(deck.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <EditDeckDialog deck={deck} />
              <AddFlashcardDialog deckId={deckIdNumber} />
            </div>
          </div>
        </div>

        {/* Flashcards section */}
        {deckFlashcards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-8 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground"
              >
                <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">No flashcards yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Start building your deck by adding flashcards. Each card has a front (question) and back (answer).
            </p>
            <AddFlashcardDialog 
              deckId={deckIdNumber}
              trigger={<Button size="lg">Add Your First Flashcard</Button>}
            />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Flashcards</h2>
              <Link href={`/decks/${deckIdNumber}/study`}>
                <Button variant="outline" size="sm">
                  Study
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deckFlashcards.map((card) => (
                <Card key={card.id} className="hover:border-primary transition-colors">
                  <CardHeader>
                    <CardTitle className="text-base">Front</CardTitle>
                    <CardDescription className="text-base text-foreground mt-2">
                      {card.front}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Back
                      </p>
                      <p className="text-sm">{card.back}</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <EditFlashcardDialog flashcard={card} />
                      <DeleteFlashcardDialog flashcard={card} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
