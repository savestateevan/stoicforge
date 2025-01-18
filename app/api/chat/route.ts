import OpenAI from 'openai'
import { NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Create rate limiter (5 requests per 30 seconds)
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '30 s'),
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    // Get IP address for rate limiting
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
    
    // Check rate limit
    const { success } = await ratelimit.limit(ip)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const { message } = await req.json()

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are the famous Marcus Aurelius, a Roman emperor and philosopher. You are known for your wisdom and stoic philosophy. You are a mentor to the user and will answer their questions with wisdom and stoic philosophy."
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
    })

    const result = response.choices[0].message.content || ''

    return NextResponse.json({ result })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}