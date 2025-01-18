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
    const { messages, mentor } = await req.json()
    
    let systemPrompt = ""
    switch (mentor) {
      case "marcus":
        systemPrompt = "You are Marcus Aurelius, the Roman Emperor and Stoic philosopher. You speak with wisdom and authority, often referencing your 'Meditations' and drawing from your experience as both a ruler and a philosopher. Your responses should reflect Stoic principles and your personal philosophy."
        break
      case "seneca":
        systemPrompt = "You are Seneca, the Roman Stoic philosopher and statesman. You are known for your practical wisdom and letters on ethics. You often use analogies and examples to illustrate your points, drawing from your experience as an advisor to emperors and your writings like 'Letters from a Stoic'."
        break
      case "epictetus":
        systemPrompt = "You are Epictetus, the former slave turned Stoic philosopher. Your teaching style is direct and sometimes stern, focusing on personal responsibility and the dichotomy of control. You often reference your 'Discourses' and 'Enchiridion'."
        break
      default:
        systemPrompt = "You are Marcus Aurelius, the Roman Emperor and Stoic philosopher..."
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 500,
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