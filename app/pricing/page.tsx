'use client'

import Link from 'next/link'
import { StripeCheckoutButton } from '@/components/StripeCheckoutButton'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Price IDs - We're using Stripe's test mode price IDs here
// For testing, you can use Stripe's test cards: https://stripe.com/docs/testing#cards
const PRICE_IDS = {
  // CRITICAL: These are example IDs that don't exist! 
  // You MUST replace them with actual price IDs from your Stripe Dashboard
  BEGINNER: 'price_1QaoC5ISdNa3NclOt5MQPbR3', // Replace with actual price ID from your Stripe dashboard
  PRO: 'price_1QaojPISdNa3NclOEL5MFFsA',      // Replace with actual price ID from your Stripe dashboard
}

console.log('Using test price IDs for Stripe checkout');

const pricingPlans = [
  {
    name: 'Beginner',
    price: '$10',
    description: 'Perfect for getting started',
    features: ['Access to famous Stoic philosophers', 'Basic guidance tools', 'Limited daily chat interactions'],
    stripePriceId: PRICE_IDS.BEGINNER,
  },
  {
    name: 'Pro',
    price: '$15',
    description: 'For serious stoics',
    features: [ 'Advanced progress tracking', 'Unlimited chat interactions', 'Personalized improvement plans'],
    stripePriceId: PRICE_IDS.PRO,
  },
]

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold sm:hidden">Pricing</h1>
        <Link href="/" className="ml-auto">
          <Button variant="outline" className="flex items-center gap-2 text-sm">
            <ArrowLeft className="h-4 w-4" />
            <span>Home</span>
          </Button>
        </Link>
      </div>
      <main className="flex-1">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Choose Your Plan</h2>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {pricingPlans.map((plan) => (
              <Card key={plan.name} className="flex flex-col h-full shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl sm:text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-sm sm:text-base">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-2">
                  <p className="text-2xl sm:text-3xl font-bold mb-4">{plan.price}<span className="text-sm font-normal">/month</span></p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="mr-2 h-4 w-4 mt-1 text-green-500 flex-shrink-0" />
                        <span className="text-sm sm:text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-2">
                  <StripeCheckoutButton 
                    items={[{ priceId: plan.stripePriceId, quantity: 1 }]} 
                    buttonText={`Subscribe to ${plan.name}`}
                    className="w-full text-sm sm:text-base py-2"
                  />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}