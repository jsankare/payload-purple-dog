import Stripe from 'stripe'

// Initialiser Stripe avec la clé secrète
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-11-17.clover',
  typescript: true,
})

// Helper pour créer un customer Stripe
export async function createStripeCustomer(email: string, name: string, userId: number) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId: userId.toString(),
      },
    })
    return customer
  } catch (error) {
    console.error('Erreur création customer Stripe:', error)
    throw error
  }
}

// Helper pour créer une session de paiement
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  userId: number,
  planId: number,
) {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/cancel`,
      metadata: {
        userId: userId.toString(),
        planId: planId.toString(),
      },
    })
    return session
  } catch (error) {
    console.error('Erreur création session checkout:', error)
    throw error
  }
}

// Helper pour annuler un abonnement
export async function cancelStripeSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Erreur annulation abonnement Stripe:', error)
    throw error
  }
}
