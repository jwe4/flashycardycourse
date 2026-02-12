'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { deleteDeck } from '@/actions/deck-actions';
import { toast } from 'sonner';

interface DeleteDeckDialogProps {
  deck: {
    id: number;
    title: string;
    description: string | null;
  };
  cardCount: number;
}

export function DeleteDeckDialog({ deck, cardCount }: DeleteDeckDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await deleteDeck({
        id: deck.id,
      });

      if (result.success) {
        toast.success('Deck deleted successfully!');
        setOpen(false);
        // Redirect to dashboard after successful deletion
        router.push('/dashboard');
      } else {
        setError(result.error || 'Failed to delete deck');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      setOpen(newOpen);
      if (!newOpen) {
        setError(null);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Delete Deck
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Deck</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this deck? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {error && (
            <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive mb-4">
              {error}
            </div>
          )}
          
          <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Deck Title:</p>
              <p className="text-base font-semibold mt-1">{deck.title}</p>
            </div>
            {deck.description && (
              <div className="border-t pt-2">
                <p className="text-sm font-medium text-muted-foreground">Description:</p>
                <p className="text-sm mt-1">{deck.description}</p>
              </div>
            )}
            <div className="border-t pt-2">
              <p className="text-sm font-medium text-destructive">
                This will permanently delete {cardCount} {cardCount === 1 ? 'flashcard' : 'flashcards'}.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Deleting...' : 'Delete Deck'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
