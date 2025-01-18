"use client"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/ModeToggle"
import { Input } from "@/components/ui/input"
import * as React from "react"
import { BookOpen, Brain, Calendar, GraduationCap, Lightbulb, Sparkles } from 'lucide-react'
import Link from "next/link"
import { SignedOut, SignedIn, SignInButton, UserButton } from '@clerk/nextjs'
export default function StudyAILanding() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="#">
          <GraduationCap className="h-6 w-6" />
          <span className="sr-only">StoicForge</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/pricing">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            About
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/chat">
            Chat
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/sign-in">
          <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </Link>
          <ModeToggle />
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Speak with Marcus Aurelius and Seneca to get advice on how to live your best life.
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Step into StoicForge, a database of virtual stoic mentors that can help you with your life decisions.             </p>
              </div>
              <div className="space-x-4">
                <Button>Get Started</Button>
                <Button variant="outline">Learn More</Button>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Our Features</h2>
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-3 text-center">
                <Brain className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Choose your mentor</h3>
                <p className="text-gray-500 dark:text-gray-400"> Choose from a database of virtual stoic mentors.</p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center">
                <Calendar className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Self-Improvement</h3>
                <p className="text-gray-500 dark:text-gray-400">AI-powered advice tailored to your specific situation.</p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center">
                <Lightbulb className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Community Features</h3>
                <p className="text-gray-500 dark:text-gray-400">Share your experiences in our community discord</p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Be better, with us.</h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Join us and grow with the StoicForge community!
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2">
                  <Input className="max-w-lg flex-1" placeholder="Enter your email" type="email" />
                  <Button type="submit">Sign Up</Button>
                </form>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  By signing up, you agree to our{" "}
                  <Link className="underline underline-offset-2" href="#">
                    Terms & Conditions
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 StoicForge. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}