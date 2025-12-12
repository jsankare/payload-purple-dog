import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { capturePaymentIntent } from '@/lib/stripe'

/**
 * POST /api/transactions/[id]/confirm-delivery
 * 
 * Confirm delivery and release funds to seller
 * Captures the Stripe Payment Intent
 * 
 * @param params.id - Transaction ID
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { id } = await params

    // Get authenticated user using Payload auth
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch transaction
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

    // Verify user is the buyer or admin
    const buyerId = typeof transaction.buyer === 'string'
      ? transaction.buyer
      : transaction.buyer?.id

    if (user.role !== 'admin' && user.id !== buyerId) {
      return NextResponse.json(
        { error: 'Only the buyer can confirm delivery' },
        { status: 403 }
      )
    }

    // Validate payment status
    if (transaction.paymentStatus !== 'held') {
      return NextResponse.json(
        { error: 'Payment must be held before confirming delivery' },
        { status: 400 }
      )
    }

    // Validate transaction status
    if (transaction.status !== 'in_transit' && transaction.status !== 'delivered') {
      return NextResponse.json(
        { error: 'Transaction must be in transit or delivered to confirm' },
        { status: 400 }
      )
    }

    // Validate payment intent exists
    if (!transaction.paymentIntentId) {
      return NextResponse.json(
        { error: 'No payment intent found for this transaction' },
        { status: 400 }
      )
    }

    // Capture payment (release funds to seller)
    await capturePaymentIntent(transaction.paymentIntentId)

    // Update transaction
    const updated = await payload.update({
      collection: 'transactions',
      id: transaction.id,
      data: {
        paymentStatus: 'released',
        status: 'completed',
        completedAt: new Date().toISOString(),
      },
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error('Error confirming delivery:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
