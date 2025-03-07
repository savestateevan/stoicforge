'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { UserButton, useAuth } from '@clerk/nextjs'
import { CreditsDisplay } from './Credits'
import { ModeToggle } from './ModeToggle'

export function MobileNav() {
  const { isSignedIn } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <div className="flex flex-col h-full">
          <div className="px-2">
            <Link 
              href="/" 
              className="font-bold text-xl block py-4 border-b"
              onClick={() => setOpen(false)}
            >
              StoicForge
            </Link>
          </div>
          
          <div className="flex flex-col gap-3 px-2 py-4">
            {isSignedIn && (
              <div className="mb-2">
                <CreditsDisplay />
              </div>
            )}
            
            <div className="space-y-3">
              {isSignedIn ? (
                <>
                  <Link 
                    href="/chat" 
                    className="flex items-center py-2 px-3 rounded-md hover:bg-accent"
                    onClick={() => setOpen(false)}
                  >
                    Chat
                  </Link>
                  <Link 
                    href="/profile" 
                    className="flex items-center py-2 px-3 rounded-md hover:bg-accent"
                    onClick={() => setOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link 
                    href="/pricing" 
                    className="flex items-center py-2 px-3 rounded-md hover:bg-accent"
                    onClick={() => setOpen(false)}
                  >
                    Pricing
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    href="/sign-in" 
                    className="flex items-center py-2 px-3 rounded-md hover:bg-accent"
                    onClick={() => setOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link 
                    href="/sign-up" 
                    className="flex items-center py-2 px-3 rounded-md hover:bg-accent"
                    onClick={() => setOpen(false)}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="mt-auto flex items-center gap-2 px-2 py-4 border-t">
            <ModeToggle />
            {isSignedIn && <UserButton afterSignOutUrl="/" />}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 