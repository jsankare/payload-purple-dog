import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-11-17.clover',
})

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 })
    }

    // 1. Verify with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    const transactionId = session.metadata?.transactionId

    if (!transactionId) {
      return NextResponse.json({ error: 'No transaction ID in session metadata' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    // 2. Find and update transaction
    // We fetch first to ensure it exists and check current status if needed
    const transaction = await payload.findByID({
      collection: 'transactions',
      id: transactionId,
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Update status if not already updated
    if (transaction.paymentStatus !== 'paid' && transaction.paymentStatus !== 'held') {
      await payload.update({
        collection: 'transactions',
        id: transactionId,
        data: {
          paymentStatus: 'held', // Or 'paid', depending on your logic (held for marketplaces usually)
          status: 'awaiting_shipping',
          paidAt: new Date().toISOString(),
          paymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error confirming payment:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
