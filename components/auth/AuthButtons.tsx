'use client'

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"

export function AuthButtons() {
  return (
    <div className="text-sm font-medium flex items-center">
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  )
} 