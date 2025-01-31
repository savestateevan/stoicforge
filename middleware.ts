import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse} from "next/server"
import { cors } from '@/lib/cors'

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/stripe",
  "/api/(.*)",
  "/pricing",
])

export default clerkMiddleware(async (auth, request) => {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return cors(request)
  }

  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  const response = NextResponse.next();
  
  // Add CORS headers to all responses
  const origin = request.headers.get('origin') || '';
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}