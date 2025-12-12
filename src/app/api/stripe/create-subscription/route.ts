import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia', // Utiliser une version récente ou celle par défaut
})

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    // Vérifier l'authentification
    const { user } = await payload.auth(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'professionnel') {
      return NextResponse.json({ error: 'Subscription is only for professionals' }, { status: 400 })
    }

    const { priceId } = await request.json()

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 })
    }

    // 1. Récupérer ou créer le client Stripe
    let customerId = user.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          payloadUserId: user.id,
        },
      })
      customerId = customer.id

      // Sauvegarder le customer ID
      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          stripeCustomerId: customerId,
        },
      })
    }

    // 2. Créer l'abonnement
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        payloadUserId: user.id,
      },
    })

    const invoice = subscription.latest_invoice as Stripe.Invoice
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent

    if (!paymentIntent?.client_secret) {
      throw new Error('Failed to create payment intent')
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
    })

  } catch (error: any) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
