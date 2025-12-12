import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { isValidBid, shouldExtendAuction, extendAuction } from '@/lib/auction'

/**
 * POST /api/bids
 * Places bid on auction object (professionals only, requires payment method)
 * @param objectId - Object ID to bid on
 * @param amount - Bid amount
 * @param isAutoBid - Enable auto-bidding (optional)
 * @param maxAutoBidAmount - Max amount for auto-bidding (optional)
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

    if (user.role !== 'professionnel') {
      return NextResponse.json(
        { error: 'Only professionals can place bids' },
        { status: 403 }
      )
    }

    /** CRITICAL: Verify user has valid payment method before bidding */
    if (!user.hasValidPaymentMethod) {
      return NextResponse.json(
        {
          error: 'You must add a payment method before bidding',
          code: 'PAYMENT_METHOD_REQUIRED',
          redirectTo: '/dashboard/profile/payment-methods'
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { objectId, amount, isAutoBid = false, maxAutoBidAmount } = body

    if (!objectId || !amount) {
      return NextResponse.json(
        { error: 'objectId and amount are required' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    let object
    try {
      object = await payload.findByID({
        collection: 'objects',
        id: objectId,
      })
    } catch (error) {
      return NextResponse.json(
        { error: 'Object not found' },
        { status: 404 }
      )
    }

    if (object.saleMode !== 'auction') {
      return NextResponse.json(
        { error: 'This object is not in auction mode' },
        { status: 400 }
      )
    }

    if (object.status !== 'active') {
      return NextResponse.json(
        { error: 'This auction is not active' },
        { status: 400 }
      )
    }

    const now = new Date()
    const auctionEndDate = new Date(object.auctionEndDate)

    if (auctionEndDate <= now) {
      return NextResponse.json(
        { error: 'This auction has ended' },
        { status: 400 }
      )
    }

    const currentBid = typeof object.currentBidAmount === 'number'
      ? object.currentBidAmount
      : object.auctionStartPrice

    const validation = isValidBid(amount, currentBid, object.reservePrice)

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const bid = await payload.create({
      collection: 'bids',
      data: {
        object: object.id,
        bidder: user.id,
        amount,
        status: 'highest',
        source: isAutoBid ? 'auto' : 'manual',
        maxAutoBidAmount: isAutoBid ? maxAutoBidAmount : undefined,
      },
      overrideAccess: true,
    })

    const shouldExtend = shouldExtendAuction(auctionEndDate)
    const newEndDate = shouldExtend ? extendAuction(auctionEndDate) : auctionEndDate

    const updatedObject = await payload.update({
      collection: 'objects',
      id: object.id,
      data: {
        currentBidAmount: amount,
        currentBidder: user.id,
        bidCount: (object.bidCount || 0) + 1,
        auctionEndDate: newEndDate.toISOString(),
        auctionExtensions: shouldExtend
          ? (object.auctionExtensions || 0) + 1
          : object.auctionExtensions,
      },
      overrideAccess: true,
    })

    /** Notify previous bidder they were outbid */
    if (object.currentBidder && object.currentBidder !== user.id) {
      try {
        const { auctionOutbidTemplate, sendEmail } = await import('@/lib/email/templates')

        const previousBidderId = typeof object.currentBidder === 'string'
          ? object.currentBidder
          : object.currentBidder?.id

        if (previousBidderId && previousBidderId !== user.id) {
          const previousBidder = await payload.findByID({
            collection: 'users',
            id: previousBidderId as string,
          })
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'
          const html = auctionOutbidTemplate({
            objectName: object.name,
            objectUrl: `${appUrl}/objets/${object.id}`,
            yourBid: currentBid,
            newBid: amount,
            userName: previousBidder.firstName,
          })
          await sendEmail(previousBidder.email, 'Vous avez été surenchéri', html)
        }
      } catch (emailError) {
        console.error('Error sending outbid email:', emailError)
      }
    }

    /** Notify seller about new bid */
    try {
      const { newBidTemplate, sendEmail } = await import('@/lib/email/templates')

      const sellerId = typeof object.seller === 'string' ? object.seller : object.seller?.id

      if (sellerId) {
        const seller = await payload.findByID({
          collection: 'users',
          id: sellerId as string,
        })

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'
        const html = newBidTemplate({
          objectName: object.name,
          objectUrl: `${appUrl}/objets/${object.id}`,
          bidAmount: amount,
          bidderName: user.firstName,
          sellerName: seller.firstName,
        })
        await sendEmail(seller.email, 'Nouvelle enchère sur votre objet !', html)
      }
    } catch (emailError) {
      console.error('Error sending seller notification email:', emailError)
    }

    return NextResponse.json(
      {
        bid,
        object: updatedObject,
        extended: shouldExtend,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error placing bid:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
