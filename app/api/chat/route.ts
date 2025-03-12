import OpenAI from 'openai'
import { NextResponse, NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { db } from '@/lib/db'
import { getAuth } from '@clerk/nextjs/server'


export const maxDuration = 60;

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

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    const { messages, mentor, saveHistory } = await req.json()
    const id = userId as string;
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let systemPrompt = ""
    switch (mentor) {
      case "marcus":
        systemPrompt = "You are Marcus Aurelius, the Roman Emperor and Stoic philosopher. You speak with wisdom and authority, often referencing your 'Meditations' and drawing from your experience as both a ruler and a philosopher. Your responses should reflect Stoic principles and your personal philosophy and help them with their goals and problems."
        break
      case "seneca":
        systemPrompt = "You are Seneca, the Roman Stoic philosopher and statesman. You are known for your practical wisdom and letters on ethics. You often use analogies and examples to illustrate your points, drawing from your experience as an advisor to emperors and your writings like 'Letters from a Stoic'. Your responses should reflect Stoic principles and your personal philosophy and help them with their goals and problems."
        break
      case "epictetus":
        systemPrompt = "You are Epictetus, the former slave turned Stoic philosopher. Your teaching style is direct and sometimes stern, focusing on personal responsibility and the dichotomy of control. You often reference your 'Discourses' and 'Enchiridion'. Your responses should reflect Stoic principles and your personal philosophy and help them with their goals and problems."
        break
      default:
        systemPrompt = "You are Marcus Aurelius, the Roman Emperor and Stoic philosopher..."
    }

    const userCredits = await db.user.findUnique({
      where: { id: userId },
    });
    
    if (!userCredits || userCredits.credits <= 0) {
      return new NextResponse("You have run out of credits.", { status: 403 });
    }

    await db.user.update({
      where: { id: userId },
      data: { credits: { decrement: 1 } },
    });

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

    if (saveHistory) {
      // Save both user message and AI response
      await db.message.createMany({
        data: [
          {
            userId,
            content: messages[messages.length - 1].content,
            role: 'user',
            mentorId: mentor,
          },
          {
            userId,
            content: result,
            role: 'assistant',
            mentorId: mentor,
          }
        ]
      })
    }

    return NextResponse.json({ result })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}