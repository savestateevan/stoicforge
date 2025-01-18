// 5. Create a cancellation page component (pages/cancel-subscription.js):
import { useState } from 'react';

export default function CancelSubscription() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCancellation = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: 'sub_YOUR_SUBSCRIPTION_ID', // You'll need to pass this dynamically
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Subscription successfully canceled');
      } else {
        setMessage('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred while canceling the subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Cancel Subscription</h1>
        {message && (
          <p className="mb-4 text-gray-600">{message}</p>
        )}
        <button
          onClick={handleCancellation}
          disabled={loading}
          className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Cancel Subscription'}
        </button>
      </div>
    </div>
  );
}