'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { generateAIFlashcards } from '@/actions/ai-flashcard-actions';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';

interface GenerateCardsWithAIButtonProps {
  deckId: number;
  canUseAI: boolean;
  hasDescription?: boolean;
}

export function GenerateCardsWithAIButton({ deckId, canUseAI, hasDescription = true }: GenerateCardsWithAIButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    if (!canUseAI) {
      router.push('/pricing');
      return;
    }

    if (!hasDescription) {
      toast.error('Please add a description to your deck first. The description helps the AI understand what topics to cover.');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateAIFlashcards({ deckId });

      if (result.success) {
        toast.success(`Successfully generated ${result.count} flashcards!`);
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to generate flashcards');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const isDisabled = isGenerating || (canUseAI && !hasDescription);

  const button = (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isDisabled}
      className="gap-2"
    >
      <Sparkles className="size-4" />
      {isGenerating ? 'Generating...' : 'Generate cards with AI'}
    </Button>
  );

  if (!canUseAI) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p>This is a paid feature. Upgrade to Pro to generate flashcards with AI.</p>
          <p className="mt-1 text-xs opacity-90">Click to view pricing plans.</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (!hasDescription) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-block">
            {button}
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p>Add a description to your deck to generate flashcards with AI.</p>
          <p className="mt-1 text-xs opacity-90">The description helps the AI understand what topics to cover.</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (isDisabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p>Generating flashcards. Please wait...</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}
