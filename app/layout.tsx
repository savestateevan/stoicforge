import type { Metadata } from "next";
import localFont from "next/font/local";
import { ClerkProvider } from '@clerk/nextjs'
import Header from '@/components/Header'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Header />
          <main>{children}</main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}

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
  title: "StoicForge",
  description: "Be better, with us.",
};

