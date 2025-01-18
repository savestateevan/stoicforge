import { stripe } from '../../../lib/stripe';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { subscriptionId } = req.body;

  try {
    const canceledSubscription = await stripe.subscriptions.del(subscriptionId);
    res.status(200).json(canceledSubscription);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred'  });
  }
}