import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

export default function SuccessPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Payment Successful!</CardTitle>
          <CardDescription className="text-center">Thank you for upgrading your plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center">Your account has been upgraded and you now have access to all premium features.</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/">Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}