'use client'

import Link from 'next/link'
import { StripeCheckoutButton } from '@/components/StripeCheckoutButton'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
const pricingPlans = [
  {
    name: 'Beginner',
    price: '$10',
    description: 'Perfect for getting started',
    features: ['Access to famous Stoic philosophers', 'Basic guidance tools', 'Limited daily chat interactions'],
    stripePriceId: 'price_1QaoC5ISdNa3NclOt5MQPbR3', // Replace with your actual Stripe Price ID
  },
  {
    name: 'Pro',
    price: '$15',
    description: 'For serious stoics',
    features: [ 'Advanced progress tracking', 'Unlimited chat interactions', 'Personalized improvement plans'],
    stripePriceId: 'price_1QaojPISdNa3NclOEL5MFFsA', // Replace with your actual Stripe Price ID
  },
]

export default function PricingPage() {
  return (
    <div className="container mx-auto">
      <div className="flex justify-end">
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Home
          </Button>
        </Link>
      </div>
      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Choose Your Plan</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {pricingPlans.map((plan) => (
              <Card key={plan.name} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-3xl font-bold mb-4">{plan.price}<span className="text-sm font-normal">/month</span></p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <StripeCheckoutButton items={[{ priceId: plan.stripePriceId, quantity: 1 }]} buttonText={`Subscribe to ${plan.name}`} />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}