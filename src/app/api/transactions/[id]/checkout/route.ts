import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { createObjectCheckoutSession } from '@/lib/stripe'

/**
 * POST /api/transactions/[id]/checkout
 * Create Stripe Checkout Session for a transaction
 * @param params.id - Transaction ID
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { id } = await params

    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let transaction
    try {
      transaction = await payload.findByID({
        collection: 'transactions',
        id,
      })
    } catch (error) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    const buyerId = typeof transaction.buyer === 'string'
      ? transaction.buyer
      : transaction.buyer?.id

    if (user.role !== 'admin' && user.id !== buyerId) {
      return NextResponse.json(
        { error: 'Only the buyer can checkout this transaction' },
        { status: 403 }
      )
    }

    if (transaction.status !== 'payment_pending') {
      return NextResponse.json(
        { error: 'This transaction is not pending payment' },
        { status: 400 }
      )
    }

    if (transaction.paymentStatus !== 'pending') {
      return NextResponse.json(
        { error: 'Payment has already been processed' },
        { status: 400 }
      )
    }

    const buyer = await payload.findByID({
      collection: 'users',
      id: buyerId,
    })

    if (!buyer.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Buyer does not have a Stripe customer ID' },
        { status: 400 }
      )
    }

    const amountInCents = Math.round(transaction.totalAmount * 100)

    const objectId = typeof transaction.object === 'string'
      ? transaction.object
      : transaction.object?.id

    const sellerId = typeof transaction.seller === 'string'
      ? transaction.seller
      : transaction.seller?.id

    const session = await createObjectCheckoutSession(
      buyer.stripeCustomerId,
      transaction.id,
      amountInCents,
      {
        transactionId: transaction.id,
        objectId,
        sellerId,
        buyerId,
      },
      buyer.stripePaymentMethodId
    )

    await payload.update({
      collection: 'transactions',
      id: transaction.id,
      data: {
        checkoutSessionId: session.id,
      },
    })

    return NextResponse.json(
      {
        url: session.url,
        sessionId: session.id,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
