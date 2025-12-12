import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * POST /api/transactions/create-from-bid
 * 
 * Create a transaction from a won auction bid
 * Called automatically when auction ends or manually by admin
 * 
 * Body:
 * - bidId: string (ID of the winning bid)
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    // Get authenticated user
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admin can manually create transactions
    // (System will use overrideAccess for automatic creation)
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

    // Fetch the bid
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

    // Verify bid is the winning bid
    if (bid.status !== 'highest') {
      return NextResponse.json(
        { error: 'This bid is not the winning bid' },
        { status: 400 }
      )
    }

    // Get the object
    const objectData = typeof bid.object === 'object' ? bid.object : await payload.findByID({
      collection: 'objects',
      id: bid.object,
    })

    // Get seller
    const sellerId = typeof objectData.seller === 'object' ? objectData.seller.id : objectData.seller

    // Get buyer (bidder)
    const buyerId = typeof bid.bidder === 'object' ? bid.bidder.id : bid.bidder

    // Get commissions from Settings (default to 3% buyer, 2% seller)
    const buyerCommissionRate = 0.03 // 3%
    const sellerCommissionRate = 0.02 // 2%

    const finalPrice = bid.amount
    const buyerCommission = finalPrice * buyerCommissionRate
    const sellerCommission = finalPrice * sellerCommissionRate
    const shippingCost = 0 // Will be set during checkout
    const totalAmount = finalPrice + buyerCommission + shippingCost
    const sellerAmount = finalPrice - sellerCommission

    // Create transaction
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
        // Addresses will be filled during checkout
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
        notes: `Transaction créée automatiquement pour l'enchère #${bid.id}`,
      },
      overrideAccess: true,
    })

    // Update object status to sold
    await payload.update({
      collection: 'objects',
      id: objectData.id,
      data: {
        status: 'sold',
      },
      overrideAccess: true,
    })

    // TODO: Send email to buyer with link to checkout
    // const buyerData = await payload.findByID({ collection: 'users', id: buyerId })
    // await sendEmail(buyerData.email, 'Vous avez remporté l\'enchère !', ...)

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
