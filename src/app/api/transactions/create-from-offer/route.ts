import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * POST /api/transactions/create-from-offer
 * Creates transaction from accepted offer (quick sale)
 * @param offerId - ID of the accepted offer
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

    const body = await request.json()
    const { offerId } = body

    if (!offerId) {
      return NextResponse.json(
        { error: 'offerId is required' },
        { status: 400 }
      )
    }

    const offer = await payload.findByID({
      collection: 'offers',
      id: offerId,
      depth: 2,
    })

    if (!offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      )
    }

    const objectData = typeof offer.object === 'object' ? offer.object : await payload.findByID({
      collection: 'objects',
      id: offer.object,
    })

    /** Verify user is the seller */
    const sellerId = typeof objectData.seller === 'object' ? objectData.seller.id : objectData.seller
    if (user.id !== sellerId && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only the seller can accept offers' },
        { status: 403 }
      )
    }

    if (offer.status !== 'pending') {
      return NextResponse.json(
        { error: 'This offer is not pending' },
        { status: 400 }
      )
    }

    const buyerId = typeof offer.buyer === 'object' ? offer.buyer.id : offer.buyer

    /** Calculate commissions - 3% buyer, 2% seller */
    const buyerCommissionRate = 0.03
    const sellerCommissionRate = 0.02

    const finalPrice = offer.amount
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
        notes: `Transaction créée pour l'offre acceptée #${offer.id}`,
      },
      overrideAccess: true,
    })

    await payload.update({
      collection: 'offers',
      id: offer.id,
      data: {
        status: 'accepted',
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
    console.error('Error creating transaction from offer:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
