import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const allowedOrigins = [
  'http://localhost:3000',
  'https://clerk.stoicforge.ai',
  'https://stoicforge.ai',
  // add any other domains you need
];

export function cors(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  
  // Check if the origin is in our allowed list
  if (allowedOrigins.includes(origin)) {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  }
} 