import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/chat(.*)', 
  '/profile(.*)',
  '/api/credits(.*)', // Explicitly protect credits API routes
  '/api/create-checkout-session(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth()

  if (!userId && isProtectedRoute(req)) {
    // Add custom logic to run before redirecting
    console.log(`Unauthorized access attempted to: ${req.url}`)
    return redirectToSignIn()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Skip processing for webhook paths
  if (path.startsWith('/api/webhooks/')) {
    return NextResponse.next()
  }
  
  // Your other middleware logic here
  // ...
}