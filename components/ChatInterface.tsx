'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

// Define types at the top level
type Message = {
  role: 'user' | 'assistant'
  content: string
  createdAt?: Date
  mentorId?: string
}

type MarkdownProps = {
  node?: any
  children?: React.ReactNode
} & React.HTMLAttributes<HTMLElement>

export default function ChatInterface() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mentor, setMentor] = useState("marcus")
  const [credits, setCredits] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { toast } = useToast()

  // Component functions
  const markdownComponents = {
    h1: ({...props}: MarkdownProps) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
    h2: ({...props}: MarkdownProps) => <h2 className="text-xl font-semibold mt-3 mb-1" {...props} />,
    h3: ({...props}: MarkdownProps) => <h3 className="text-lg font-medium mt-2 mb-1" {...props} />,
    p: ({...props}: MarkdownProps) => <p className="mb-2" {...props} />,
    ul: ({...props}: MarkdownProps) => <ul className="list-disc pl-4 mb-2" {...props} />,
    ol: ({...props}: MarkdownProps) => <ol className="list-decimal pl-4 mb-2" {...props} />,
    li: ({...props}: MarkdownProps) => <li className="mb-1" {...props} />,
    blockquote: ({...props}: MarkdownProps) => (
      <blockquote className="border-l-2 border-gray-300 pl-2 italic my-2" {...props} />
    ),
    code: ({inline, children, ...props}: MarkdownProps & { inline?: boolean }) => 
      inline ? (
        <code className="bg-gray-200 rounded px-1" {...props}>{children}</code>
      ) : (
        <pre className="bg-gray-200 rounded p-2 overflow-x-auto" {...props}>{children}</pre>
      ),
  }

  useEffect(() => {
    if (user) {
      fetchCredits()
      fetchChatHistory()
    }
  }, [user])

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/credits/balance')
      const data = await response.json()
      setCredits(data.credits)
    } catch (error) {
      console.error('Error fetching credits:', error)
    }
  }

  const fetchChatHistory = async () => {
    try {
      const response = await fetch('/api/chat/history')
      const data = await response.json()
      if (data.messages) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Error fetching chat history:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    if (!user) {
      router.push('/sign-in')
      return
    }
    if (credits !== null && credits <= 0) {
      toast({
        variant: "destructive",
        description: 'You have no credits left. Please purchase more to continue.'
      })
      return
    }

    const userMessage: Message = {
      role: 'user',
      content: input,
      createdAt: new Date(),
      mentorId: mentor
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          mentor,
          saveHistory: true
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.result }])
      fetchCredits()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to get response from AI',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isLoaded) return <div>Loading...</div>

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] border rounded-lg">
        <p className="text-lg mb-4">Please sign in to chat with Stoic mentors</p>
        <Button onClick={() => router.push('/sign-in')}>Sign In</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      <div className="p-4 border-b flex justify-between items-center">
        <Select value={mentor} onValueChange={setMentor}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select your mentor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="marcus">Marcus Aurelius</SelectItem>
            <SelectItem value="seneca">Seneca</SelectItem>
            <SelectItem value="epictetus">Epictetus</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-sm">
          {credits !== null ? `${credits} credits remaining` : 'Loading...'}
        </div>
      </div>
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <ScrollArea className="h-[40vh] w-full pr-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
              >
                <span
                  className={`inline-block p-2 rounded-lg ${
                    message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]]}
                    components={markdownComponents}
                  >
                    {message.content || ''}
                  </ReactMarkdown>
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </ScrollArea>
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}