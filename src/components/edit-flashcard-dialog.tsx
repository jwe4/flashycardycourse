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
import { updateFlashcard } from '@/actions/flashcard-actions';
import { toast } from 'sonner';

interface EditFlashcardDialogProps {
  flashcard: {
    id: number;
    front: string;
    back: string;
  };
}

export function EditFlashcardDialog({ flashcard }: EditFlashcardDialogProps) {
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState(flashcard.front);
  const [back, setBack] = useState(flashcard.back);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await updateFlashcard({
        id: flashcard.id,
        front: front.trim(),
        back: back.trim(),
      });

      if (result.success) {
        toast.success('Flashcard updated successfully!');
        setOpen(false);
        // Reset form to new values
        if (result.flashcard) {
          setFront(result.flashcard.front);
          setBack(result.flashcard.back);
        }
      } else {
        setError(result.error || 'Failed to update flashcard');
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
        setFront(flashcard.front);
        setBack(flashcard.back);
        setError(null);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex-1">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Flashcard</DialogTitle>
            <DialogDescription>
              Update the front and back of your flashcard. Click save when you're done.
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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
