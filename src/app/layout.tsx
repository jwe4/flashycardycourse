import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "FlashyCardy - Your Personal Flashcard Platform",
  description: "Create and study flashcards to enhance your learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en" className="dark">
        <body
          className={`${poppins.variable} antialiased`}
        >
          <header className="border-b border-border bg-card/50 backdrop-blur">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <Link href="/dashboard" className="text-xl font-bold tracking-tight hover:text-primary transition-colors">
                FlashyCardy
              </Link>
              <div className="flex items-center gap-2">
                <SignedOut>
                  <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                    <Button variant="ghost">Sign In</Button>
                  </SignInButton>
                  <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                    <Button>Sign Up</Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </div>
            </div>
          </header>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
