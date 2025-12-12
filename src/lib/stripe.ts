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

// ========== Helpers pour paiements d'objets ==========

// Helper pour créer un Payment Intent avec capture manuelle
export async function createObjectPaymentIntent(
  customerId: string,
  amount: number,
  metadata: {
    transactionId: string
    objectId: string
    sellerId: string
    buyerId: string
  }
) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      customer: customerId,
      amount, // en centimes
      currency: 'eur',
      payment_method_types: ['card'],
      capture_method: 'manual', // IMPORTANT: Capture manuelle pour bloquer les fonds
      metadata,
    })
    return paymentIntent
  } catch (error) {
    console.error('Erreur création payment intent:', error)
    throw error
  }
}

// Helper pour capturer un Payment Intent (verser les fonds au vendeur)
export async function capturePaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId)
    return paymentIntent
  } catch (error) {
    console.error('Erreur capture payment:', error)
    throw error
  }
}

// Helper pour créer une session de paiement pour un objet
export async function createObjectCheckoutSession(
  customerId: string,
  transactionId: string,
  amount: number,
  metadata: {
    transactionId: string
    objectId: string
    sellerId: string
    buyerId: string
  },
  paymentMethodId?: string // Optional: use saved payment method
) {
  try {
    const sessionParams: any = {
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'payment', // Mode paiement unique (pas abonnement)
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Achat objet Purple Dog',
            },
            unit_amount: amount, // en centimes
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        capture_method: 'manual', // IMPORTANT: Capture manuelle
        metadata,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/cancel`,
      metadata: {
        transactionId,
      },
    }

    // If user has a saved payment method, use it
    if (paymentMethodId) {
      sessionParams.payment_method_options = {
        card: {
          setup_future_usage: 'off_session',
        },
      }
      // Pre-fill the payment method in checkout
      sessionParams.customer_update = {
        shipping: 'auto',
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)
    return session
  } catch (error) {
    console.error('Erreur création session checkout objet:', error)
    throw error
  }
}
