// components/ChatInterface.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Card } from './ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

type Mentor = 'marcus' | 'seneca' | 'epictetus'

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mentor, setMentor] = useState<Mentor>('marcus')
  const [credits, setCredits] = useState<number | null>(null)
  const { toast: oldToast } = useToast()

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/credits/balance')
      if (!response.ok) throw new Error('Failed to fetch credits')
      const data = await response.json()
      setCredits(data.credits)
      
      if (data.credits === 0) {
        toast.error("You're out of credits", {
          description: "Purchase more credits to continue your conversation.",
          action: {
            label: "Get Credits",
            onClick: () => window.location.href = "/pricing"
          },
          position: "top-center",
          duration: 5000
        })
      }
    } catch (error) {
      console.error('Error fetching credits:', error)
    }
  }

  useEffect(() => {
    fetchCredits()
    
    if (credits === 0) {
      toast.error("You're out of credits", {
        description: "Purchase more credits to continue your conversation.",
        action: {
          label: "Get Credits",
          onClick: () => window.location.href = "/pricing"
        },
        position: "top-center",
        duration: 5000
      })
    }
  }, [credits])

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return
    
    if (credits !== null && credits <= 0) {
      toast.error("No credits remaining", {
        description: "Please purchase more credits to continue chatting",
        action: {
          label: "Get Credits",
          onClick: () => window.location.href = "/pricing"
        }
      })
      return
    }

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          mentor,
          saveHistory: true
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.result }])
      
      fetchCredits()
    } catch (error) {
      console.error('Error:', error)
      toast.error("Error", {
        description: (error as Error).message || "Failed to send message"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="flex mb-4 space-x-2">
        <Button 
          variant={mentor === 'marcus' ? 'default' : 'outline'}
          onClick={() => setMentor('marcus')}
        >
          Marcus Aurelius
        </Button>
        <Button 
          variant={mentor === 'seneca' ? 'default' : 'outline'}
          onClick={() => setMentor('seneca')}
        >
          Seneca
        </Button>
        <Button 
          variant={mentor === 'epictetus' ? 'default' : 'outline'}
          onClick={() => setMentor('epictetus')}
        >
          Epictetus
        </Button>
        {credits !== null && (
          <div className="ml-auto rounded-md bg-amber-100 dark:bg-amber-950 px-2.5 py-1.5 text-sm font-medium text-amber-800 dark:text-amber-200 flex items-center">
            Credits: {credits}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 border rounded-md">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 h-full flex items-center justify-center">
            <p>Start a conversation with your Stoic mentor</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <Card 
              key={index} 
              className={`p-3 ${
                message.role === 'user' 
                  ? 'ml-auto bg-primary text-primary-foreground' 
                  : 'mr-auto bg-secondary'
              } max-w-[80%]`}
            >
              {message.content}
            </Card>
          ))
        )}
        {loading && (
          <Card className="p-3 mr-auto bg-secondary flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Thinking...</span>
          </Card>
        )}
      </div>

      <div className="flex space-x-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSendMessage()
            }
          }}
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={loading || !input.trim()}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
        </Button>
      </div>
    </div>
  )
}