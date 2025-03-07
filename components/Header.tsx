// components/Header.tsx
'use client'

import Link from 'next/link'
import { UserButton, useAuth } from '@clerk/nextjs'
import { ModeToggle } from './ModeToggle'
import { CreditsDisplay } from './Credits'
import { MobileNav } from './MobileNav'

export default function Header() {
  const { isSignedIn } = useAuth()

  return (
    <header className="border-b sticky top-0 z-40 bg-background">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Mobile Navigation */}
        <div className="flex items-center md:hidden">
          <MobileNav />
          <Link href="/" className="font-bold text-xl ml-2">
            StoicForge
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <Link href="/" className="font-bold text-xl">
            StoicForge
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Only show credits on desktop */}
          <div className="hidden md:block">
            {isSignedIn && <CreditsDisplay />}
          </div>
          
          {/* Desktop navigation links */}
          <nav className="hidden md:flex items-center gap-4">
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
          
          {/* Mobile icons */}
          <div className="md:hidden flex items-center gap-2">
            <ModeToggle />
            {isSignedIn && <UserButton afterSignOutUrl="/" />}
          </div>
        </div>
      </div>
    </header>
  )
}