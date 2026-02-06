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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createFlashcard } from '@/actions/flashcard-actions';
import { toast } from 'sonner';

interface AddFlashcardDialogProps {
  deckId: number;
  trigger?: React.ReactNode;
}

export function AddFlashcardDialog({ deckId, trigger }: AddFlashcardDialogProps) {
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createFlashcard({
        deckId,
        front: front.trim(),
        back: back.trim(),
      });

      if (result.success) {
        toast.success('Flashcard added successfully!');
        setOpen(false);
        // Reset form
        setFront('');
        setBack('');
      } else {
        setError(result.error || 'Failed to create flashcard');
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
      // Reset form values when dialog closes
      if (!newOpen) {
        setFront('');
        setBack('');
        setError(null);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || <Button>Add Flashcard</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Flashcard</DialogTitle>
            <DialogDescription>
              Create a new flashcard with a front (question) and back (answer).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="front">
                Front <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="e.g., What is the capital of France?"
                required
                rows={3}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                The question or prompt
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="back">
                Back <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="e.g., Paris"
                required
                rows={3}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                The answer or response
              </p>
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
            <Button type="submit" disabled={isSubmitting || !front.trim() || !back.trim()}>
              {isSubmitting ? 'Adding...' : 'Add Flashcard'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
