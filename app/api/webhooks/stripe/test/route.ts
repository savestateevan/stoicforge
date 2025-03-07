import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Simple testing endpoint for webhook connectivity
export async function GET(req: Request) {
  return NextResponse.json({
    status: 'ok',
    message: 'Webhook test endpoint is responding',
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  console.log('Test webhook POST received');
  try {
    const body = await req.text();
    console.log('Test webhook body length:', body.length);
    
    return NextResponse.json({
      status: 'ok',
      message: 'Webhook POST test successful',
      bodyLength: body.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Test webhook error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Error processing webhook test',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 