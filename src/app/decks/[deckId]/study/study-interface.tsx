'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Deck {
  id: number;
  title: string;
  description: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Flashcard {
  id: number;
  deckId: number;
  front: string;
  back: string;
  createdAt: Date;
  updatedAt: Date;
}

interface StudyInterfaceProps {
  deck: Deck;
  flashcards: Flashcard[];
  deckId: number;
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function StudyInterface({ deck, flashcards: initialFlashcards, deckId }: StudyInterfaceProps) {
  const [flashcards, setFlashcards] = useState(initialFlashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  const currentCard = flashcards[currentIndex];
  const totalCards = flashcards.length;
  const isLastCard = currentIndex === totalCards - 1;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      // Reached the end of the deck
      setShowCompletionDialog(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleCorrect = () => {
    setCorrectCount(correctCount + 1);
    handleNext();
  };

  const handleIncorrect = () => {
    setIncorrectCount(incorrectCount + 1);
    handleNext();
  };

  const handleStudyAgain = () => {
    // Shuffle the deck and reset everything
    setFlashcards(shuffleArray(initialFlashcards));
    setCurrentIndex(0);
    setIsFlipped(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    setShowCompletionDialog(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleFlip();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrevious();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/decks/${deckId}`}>
            <Button variant="ghost" size="sm" className="mb-4">
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
              Back to Deck
            </Button>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
                Study Mode
              </h1>
              <p className="text-muted-foreground text-lg">
                {deck.title}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <Badge variant="default" className="text-lg px-4 py-2 bg-green-600 hover:bg-green-600">
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
                    className="mr-2"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {correctCount}
                </Badge>
                <span className="text-xs text-muted-foreground mt-1">Correct</span>
              </div>
              <div className="flex flex-col items-center">
                <Badge variant="default" className="text-lg px-4 py-2 bg-red-600 hover:bg-red-600">
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
                    className="mr-2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  {incorrectCount}
                </Badge>
                <span className="text-xs text-muted-foreground mt-1">Incorrect</span>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {currentIndex + 1} / {totalCards}
              </Badge>
            </div>
          </div>
        </div>

        {/* Flashcard */}
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 text-center">
            <p className="text-sm text-muted-foreground">
              Click the card to flip • Use arrow keys to navigate
            </p>
          </div>

          <div 
            className="perspective-1000 mb-8"
            onKeyDown={handleKeyPress}
            tabIndex={0}
            role="button"
            aria-label={isFlipped ? 'Card showing back. Click to flip.' : 'Card showing front. Click to flip.'}
          >
            <div
              className={`relative w-full h-[400px] transition-transform duration-500 transform-style-3d cursor-pointer ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
              onClick={handleFlip}
            >
              {/* Front of card */}
              <Card
                className={`absolute inset-0 backface-hidden ${
                  isFlipped ? 'pointer-events-none' : ''
                }`}
              >
                <CardContent className="flex flex-col items-center justify-center h-full p-8">
                  <div className="text-sm font-medium text-muted-foreground mb-4">
                    QUESTION
                  </div>
                  <div className="text-2xl text-center font-medium">
                    {currentCard.front}
                  </div>
                </CardContent>
              </Card>

              {/* Back of card */}
              <Card
                className={`absolute inset-0 backface-hidden rotate-y-180 ${
                  !isFlipped ? 'pointer-events-none' : ''
                }`}
              >
                <CardContent className="flex flex-col items-center justify-center h-full p-8 bg-primary/5">
                  <div className="text-sm font-medium text-muted-foreground mb-4">
                    ANSWER
                  </div>
                  <div className="text-2xl text-center font-medium">
                    {currentCard.back}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-between w-full max-w-md">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                size="lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Previous
              </Button>

              <Button
                variant="default"
                onClick={handleFlip}
                size="lg"
              >
                {isFlipped ? 'Show Question' : 'Show Answer'}
              </Button>

              <Button
                variant="outline"
                onClick={handleNext}
                size="lg"
              >
                {isLastCard ? 'Finish' : 'Next'}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-2"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Button>
            </div>

            {/* Correct/Incorrect Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleIncorrect}
                size="lg"
                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Incorrect
              </Button>

              <Button
                variant="outline"
                onClick={handleCorrect}
                size="lg"
                className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Correct
              </Button>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="max-w-md mx-auto mt-8">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">Study Session Complete!</DialogTitle>
            <DialogDescription>
              Great job! You&apos;ve completed all {totalCards} flashcards in this deck.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center gap-8 py-6">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-600 dark:text-green-400"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {correctCount}
              </div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-red-600 dark:text-red-400"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {incorrectCount}
              </div>
              <div className="text-sm text-muted-foreground">Incorrect</div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Link href={`/decks/${deckId}`} className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                Return to Deck
              </Button>
            </Link>
            <Button onClick={handleStudyAgain} className="w-full sm:w-auto">
              Study Again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
