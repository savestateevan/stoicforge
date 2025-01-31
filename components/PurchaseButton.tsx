'use client'

export function PurchaseButton() {
  const handlePurchase = async () => {
    try {
      const response = await fetch('/api/purchase', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 100,
          // other data
        }),
      })
      
      if (!response.ok) {
        throw new Error('Purchase failed')
      }
      
      const data = await response.json()
      // Handle success
    } catch (error) {
      console.error('Error:', error)
      // Handle error
    }
  }

  return (
    <button onClick={handlePurchase}>
      Purchase Credits
    </button>
  )
} 