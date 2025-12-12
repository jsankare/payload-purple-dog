import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * PUT /api/offers/[id]/accept
 * 
 * Accept an offer (seller only)
 * Creates a transaction and marks object as sold
 * 
 * @param params.id - Offer ID
 */
export async function PUT(
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

    // Fetch offer
    let offer
    try {
      offer = await payload.findByID({
        collection: 'offers',
        id,
      })
    } catch (error) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      )
    }

    // Fetch associated object
    const object = await payload.findByID({
      collection: 'objects',
      id: typeof offer.object === 'string' ? offer.object : offer.object.id,
    })

    // Verify user is the seller or admin
    const sellerId = typeof object.seller === 'string' ? object.seller : object.seller?.id

    if (user.role !== 'admin' && user.id !== sellerId) {
      return NextResponse.json(
        { error: 'Only the seller can accept this offer' },
        { status: 403 }
      )
    }

    // Validate offer status
    if (offer.status !== 'pending') {
      return NextResponse.json(
        { error: 'This offer has already been processed' },
        { status: 400 }
      )
    }

    // Validate object status
    if (object.status !== 'active') {
      return NextResponse.json(
        { error: 'This object is no longer available' },
        { status: 400 }
      )
    }

    // Update offer status
    const updatedOffer = await payload.update({
      collection: 'offers',
      id: offer.id,
      data: {
        status: 'accepted',
      },
    })

    // Update object status
    const updatedObject = await payload.update({
      collection: 'objects',
      id: object.id,
      data: {
        status: 'sold',
        soldAt: new Date().toISOString(),
      },
    })

    // Get commission rates from settings
    const settings = await payload.findGlobal({ slug: 'settings' })
    const buyerCommissionRate = settings.globalBuyerCommission || 3
    const sellerCommissionRate = settings.globalSellerCommission || 2

    // Calculate amounts
    const finalPrice = offer.amount
    const buyerCommission = Math.round(finalPrice * (buyerCommissionRate / 100))
    const sellerCommission = Math.round(finalPrice * (sellerCommissionRate / 100))
    const shippingCost = 0 // To be determined later
    const totalAmount = finalPrice + buyerCommission + shippingCost
    const sellerAmount = finalPrice - sellerCommission

    // Create transaction
    const buyerId = typeof offer.buyer === 'string' ? offer.buyer : offer.buyer.id

    const transaction = await payload.create({
      collection: 'transactions',
      data: {
        object: object.id,
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
      },
      overrideAccess: true, // Bypass admin-only access control
    })

    // Reject all other pending offers for this object
    const otherOffers = await payload.find({
      collection: 'offers',
      where: {
        object: { equals: object.id },
        id: { not_equals: offer.id },
        status: { equals: 'pending' },
      },
    })

    for (const otherOffer of otherOffers.docs) {
      await payload.update({
        collection: 'offers',
        id: otherOffer.id,
        data: {
          status: 'rejected',
        },
        overrideAccess: true,
      })
    }

    // Send email notification to buyer
    try {
      const { purchaseConfirmationTemplate, sendEmail } = await import('@/lib/email/templates')
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'

      const buyer = await payload.findByID({
        collection: 'users',
        id: buyerId as string,
      })

      const buyerHtml = purchaseConfirmationTemplate({
        objectName: object.name,
        objectUrl: `${appUrl}/objets/${object.id}`,
        totalAmount,
        buyerName: `${buyer.firstName} ${buyer.lastName}`,
        checkoutUrl: `${appUrl}/checkout/${transaction.id}`,
      })
      await sendEmail(buyer.email, 'Votre offre a été acceptée !', buyerHtml)
    } catch (emailError) {
      console.error('Error sending offer acceptance email:', emailError)
    }

    return NextResponse.json(
      {
        offer: updatedOffer,
        object: updatedObject,
        transaction,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error accepting offer:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
