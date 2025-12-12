import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { stripe } from '@/lib/stripe'

/**
 * POST /api/transactions/[id]/payment-intent
 * Create Stripe Payment Intent for a transaction
 * Used with Payment Elements (not Checkout Sessions)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { id } = await params
    const body = await request.json()
    const { shippingAddress, billingAddress, shippingCarrier, shippingCost } = body

    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const transaction = await payload.findByID({
      collection: 'transactions',
      id,
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    const buyerId = typeof transaction.buyer === 'object'
      ? transaction.buyer?.id
      : transaction.buyer

    if (user.role !== 'admin' && user.id !== buyerId) {
      return NextResponse.json(
        { error: 'Only the buyer can pay for this transaction' },
        { status: 403 }
      )
    }

    if (transaction.paymentStatus !== 'pending') {
      return NextResponse.json(
        { error: 'Payment has already been processed' },
        { status: 400 }
      )
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer ID found' },
        { status: 400 }
      )
    }

    const totalAmount = transaction.finalPrice + transaction.buyerCommission + (shippingCost || 0)
    const amountInCents = Math.round(totalAmount * 100)

    let paymentIntent

    if (transaction.paymentIntentId) {
      paymentIntent = await stripe.paymentIntents.retrieve(transaction.paymentIntentId)

      if (paymentIntent.amount !== amountInCents) {
        paymentIntent = await stripe.paymentIntents.update(transaction.paymentIntentId, {
          amount: amountInCents,
        })
      }
    } else {
      const paymentIntentParams: any = {
        amount: amountInCents,
        currency: 'eur',
        customer: user.stripeCustomerId,
        capture_method: 'manual',
        payment_method_types: ['card'],
        setup_future_usage: 'off_session',
        metadata: {
          transactionId: transaction.id,
          objectId: typeof transaction.object === 'object' ? transaction.object?.id : transaction.object,
          buyerId: user.id,
        },
      }

      if (user.stripePaymentMethodId) {
        paymentIntentParams.payment_method = user.stripePaymentMethodId
      }

      paymentIntent = await stripe.paymentIntents.create(paymentIntentParams)

      await payload.update({
        collection: 'transactions',
        id: transaction.id,
        data: {
          paymentIntentId: paymentIntent.id,
          shippingAddress,
          billingAddress,
          shippingCarrier,
          shippingCost: shippingCost || 0,
          totalAmount,
        },
        overrideAccess: true,
      })
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    }, { status: 200 })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
