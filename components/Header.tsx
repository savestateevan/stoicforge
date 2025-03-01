// components/Header.tsx
'use client'

import Link from 'next/link'
import { UserButton, useAuth } from '@clerk/nextjs'
import { ModeToggle } from './ModeToggle'
import { CreditsDisplay } from './Credits'

export default function Header() {
  const { isSignedIn } = useAuth()

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          StoicForge
        </Link>
        
        <div className="flex items-center gap-4">
          {isSignedIn && <CreditsDisplay />}
          
          <nav className="flex items-center gap-4">
            {isSignedIn ? (
              <>
                <Link href="/chat" className="hover:underline">
                  Chat
                </Link>
                <Link href="/profile" className="hover:underline">
                  Profile
                </Link>
                <Link href="/pricing" className="hover:underline">
                  Pricing
                </Link>
              </>
            ) : (
              <>
                <Link href="/sign-in" className="hover:underline">
                  Sign in
                </Link>
                <Link href="/sign-up" className="hover:underline">
                  Sign up
                </Link>
              </>
            )}
            <ModeToggle />
            {isSignedIn && <UserButton afterSignOutUrl="/" />}
          </nav>
        </div>
      </div>
    </header>
  )
}