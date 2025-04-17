import type { Metadata } from "next";
import localFont from "next/font/local";
import { ClerkProvider } from '@clerk/nextjs'
import Header from '@/components/Header'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import React from 'react'
import { Toaster } from 'sonner'


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title:
  'StoicForge – Chat with Marcus Aurelius, Seneca & More | AI Stoic Mentor',
  description:
  'Get actionable, historically‑grounded Stoic advice from AI versions of Marcus Aurelius, Seneca, Epictetus and others. Free to try – forge your resilience today.',
  openGraph: {
  images: '/og-card.jpg', // relative paths resolve to your /public folder
  url: 'https://www.stoicforge.ai',
  type: 'website',
},
alternates: {
  canonical: 'https://www.stoicforge.ai',
},
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            {children}
          </ThemeProvider>
          <Toaster />
      </body>
    </html>
    </ClerkProvider>
  );
}

