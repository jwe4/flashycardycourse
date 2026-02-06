import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default async function Home() {
  // Redirect authenticated users to dashboard
  const { userId } = await auth();
  
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main content */}
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <main className="flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-6xl font-bold tracking-tight text-foreground mb-4">
            FlashyCardy
          </h1>
          <p className="text-2xl text-muted-foreground mb-8">
            Your personal flashcard platform
          </p>
          <div className="flex gap-4">
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <Button size="lg" variant="default">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
              <Button size="lg" variant="outline">
                Sign Up
              </Button>
            </SignUpButton>
          </div>
        </main>
      </div>
    </div>
  );
}
