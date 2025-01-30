import ChatInterface from '@/components/ChatInterface'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function ChatPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 relative z-10">

      <div className="flex justify-between items-center mb-6 px-4">
        <h1 className="text-3xl font-bold">Chat with your Stoic Mentor</h1>
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Home
          </Button>
        </Link>
      </div>
      <ChatInterface />
    </div>
  )
}