'use client'

import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "./ModeToggle";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { Credits } from './Credits'

export default function Header() {
  return (
    <header className="px-4 lg:px-6 h-14 flex items-center">
      <Link className="flex items-center justify-center" href="/">
        <GraduationCap className="h-6 w-6" />
        <span className="sr-only">StoicForge</span>
      </Link>
      <nav className="ml-auto flex items-center gap-4 sm:gap-6">
        <Credits />
        <Link className="text-sm font-medium hover:underline underline-offset-4" href="/pricing">
          Pricing
        </Link>
        <Link className="text-sm font-medium hover:underline underline-offset-4" href="/chat">
          Chat
        </Link>
        <Link className="text-sm font-medium hover:underline underline-offset-4" href="/profile">
          Profile
        </Link>
        <div className="text-sm font-medium flex items-center">
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="" />
          </SignedIn>
        </div>
        <ModeToggle />
      </nav>
    </header>
  );
}
