import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { decks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateDeckDialog } from '@/components/create-deck-dialog';

export default async function DashboardPage() {
  // Authenticate user
  const { userId, has } = await auth();
  
  if (!userId) {
    redirect('/');
  }

  // Fetch user's decks
  const userDecks = await db.select().from(decks).where(eq(decks.userId, userId));

  // Check if user can create more decks (Pro = unlimited, Free = 3 max)
  const canCreateUnlimited = has({ feature: 'unlimited_decks' });
  const hasDeckLimit = has({ feature: '3_deck_limit' });
  const canCreateDeck =
    canCreateUnlimited || (hasDeckLimit && userDecks.length < 3);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              My Decks
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your flashcard decks
            </p>
          </div>
          {canCreateDeck ? (
            <CreateDeckDialog>
              <Button size="lg">
                Create New Deck
              </Button>
            </CreateDeckDialog>
          ) : (
            <Button size="lg" asChild>
              <Link href="/pricing">
                Upgrade to Pro for Unlimited Decks
              </Link>
            </Button>
          )}
        </div>

        {userDecks.length === 0 ? (
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
                <rect width="7" height="7" x="3" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" />
                <rect width="7" height="7" x="3" y="14" rx="1" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">No decks yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Get started by creating your first flashcard deck. Organize your learning materials and start studying!
            </p>
            {canCreateDeck ? (
              <CreateDeckDialog>
                <Button size="lg">
                  Create Your First Deck
                </Button>
              </CreateDeckDialog>
            ) : (
              <Button size="lg" asChild>
                <Link href="/pricing">
                  Upgrade to Pro for Unlimited Decks
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userDecks.map((deck) => (
              <Link
                key={deck.id}
                href={`/decks/${deck.id}`}
                className="block group"
                // Remove any default styles that would prevent full-card clickability if present
              >
                <Card className="hover:border-primary transition-colors cursor-pointer group-active:opacity-90">
                  <CardHeader>
                    <CardTitle>{deck.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {deck.description && (
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {deck.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        Updated {new Date(deck.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
