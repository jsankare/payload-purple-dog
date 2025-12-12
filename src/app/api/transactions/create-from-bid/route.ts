import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * POST /api/transactions/create-from-bid
 * Create a transaction from a won auction bid
 * Called automatically when auction ends or manually by admin
 * 
 * Body:
 * - bidId: string (ID of the winning bid)
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can manually create transactions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { bidId } = body

    if (!bidId) {
      return NextResponse.json(
        { error: 'bidId is required' },
        { status: 400 }
      )
    }

    const bid = await payload.findByID({
      collection: 'bids',
      id: bidId,
      depth: 2,
    })

    if (!bid) {
      return NextResponse.json(
        { error: 'Bid not found' },
        { status: 404 }
      )
    }

    if (bid.status !== 'highest') {
      return NextResponse.json(
        { error: 'This bid is not the winning bid' },
        { status: 400 }
      )
    }

    const objectData = typeof bid.object === 'object' ? bid.object : await payload.findByID({
      collection: 'objects',
      id: bid.object,
    })

    const sellerId = typeof objectData.seller === 'object' ? objectData.seller.id : objectData.seller
    const buyerId = typeof bid.bidder === 'object' ? bid.bidder.id : bid.bidder

    const buyerCommissionRate = 0.03
    const sellerCommissionRate = 0.02

    const finalPrice = bid.amount
    const buyerCommission = finalPrice * buyerCommissionRate
    const sellerCommission = finalPrice * sellerCommissionRate
    const shippingCost = 0
    const totalAmount = finalPrice + buyerCommission + shippingCost
    const sellerAmount = finalPrice - sellerCommission

    const transaction = await payload.create({
      collection: 'transactions',
      data: {
        object: objectData.id,
        buyer: buyerId,
        seller: sellerId,
        finalPrice,
        buyerCommission,
        sellerCommission,
        shippingCost,
        totalAmount,
        sellerAmount,
        paymentStatus: 'pending',
        status: 'payment_pending',
        shippingAddress: {
          street: '',
          city: '',
          postalCode: '',
          country: 'France',
        },
        billingAddress: {
          street: '',
          city: '',
          postalCode: '',
          country: 'France',
        },
        notes: `Transaction created automatically for auction #${bid.id}`,
      },
      overrideAccess: true,
    })

    await payload.update({
      collection: 'objects',
      id: objectData.id,
      data: {
        status: 'sold',
      },
      overrideAccess: true,
    })

    return NextResponse.json({
      transaction,
      message: 'Transaction created successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction from bid:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
