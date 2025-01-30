import type { Metadata } from "next";
import localFont from "next/font/local";
import { ClerkProvider } from '@clerk/nextjs'
import Header from '@/components/Header'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'


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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{
      variables: { colorPrimary: "#000000" },
      elements: {
        formButtonPrimary:
          "bg-black border border-black border-solid hover:bg-white hover:text-black",
        socialButtonsBlockButton:
          "bg-white border-gray-200 hover:bg-transparent hover:border-black text-gray-600 hover:text-black",
        socialButtonsBlockButtonText: "font-semibold",
        formButtonReset:
          "bg-white border border-solid border-gray-200 hover:bg-transparent hover:border-black text-gray-500 hover:text-black",
        membersPageInviteButton:
          "bg-black border border-black border-solid hover:bg-white hover:text-black",
        card: "bg-[#fafafa]",
      },
    }}>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Header />
          <main>{children}</main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

