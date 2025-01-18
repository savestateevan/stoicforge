'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import ReactMarkdown from "react-markdown";
import remarkGfm  from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [mentor, setMentor] = useState("marcus")

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      role: 'user',
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          mentor: mentor,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      const aiMessage: Message = { 
        role: 'assistant', 
        content: data.result 
      }
      
      setMessages(prev => [...prev, aiMessage])
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get response from AI'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      <div className="p-4 border-b">
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
      </div>
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <ScrollArea className="h-[40vh] w-full pr-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <span
                  className={`inline-block p-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                > 
                <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-semibold mt-3 mb-1" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-medium mt-2 mb-1" {...props} />,
                  p: ({node, ...props}) => <p className="mb-2" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-gray-300 pl-2 italic my-2" {...props} />,
                  code: ({node, inline, ...props}) => 
                    inline 
                      ? <code className="bg-gray-200 rounded px-1" {...props} />
                      : <pre className="bg-gray-200 rounded p-2 overflow-x-auto" {...props} />,
                }}
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