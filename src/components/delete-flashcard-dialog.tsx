'use client';

import { useState } from 'react';
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
import { deleteFlashcard } from '@/actions/flashcard-actions';
import { toast } from 'sonner';

interface DeleteFlashcardDialogProps {
  flashcard: {
    id: number;
    front: string;
    back: string;
  };
}

export function DeleteFlashcardDialog({ flashcard }: DeleteFlashcardDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await deleteFlashcard({
        id: flashcard.id,
      });

      if (result.success) {
        toast.success('Flashcard deleted successfully!');
        setOpen(false);
      } else {
        setError(result.error || 'Failed to delete flashcard');
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
        <Button variant="destructive" size="sm" className="flex-1">
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Flashcard</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this flashcard? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {error && (
            <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive mb-4">
              {error}
            </div>
          )}
          
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Front:</p>
              <p className="text-sm mt-1">{flashcard.front}</p>
            </div>
            <div className="border-t pt-2">
              <p className="text-sm font-medium text-muted-foreground">Back:</p>
              <p className="text-sm mt-1">{flashcard.back}</p>
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
            {isSubmitting ? 'Deleting...' : 'Delete Flashcard'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
