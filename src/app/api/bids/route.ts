import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { isValidBid, shouldExtendAuction, extendAuction } from '@/lib/auction'

/**
 * POST /api/bids
 * 
 * Place a bid on an auction object
 * 
 * Body:
 * - objectId: string
 * - amount: number
 * - isAutoBid?: boolean (default: false)
 * - maxAutoBidAmount?: number
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    // Get authenticated user using Payload auth
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user has permission to bid (professionals only)
    if (user.role !== 'professionnel') {
      return NextResponse.json(
        { error: 'Only professionals can place bids' },
        { status: 403 }
      )
    }

    // 🚨 CRITICAL: Verify user has valid payment method before bidding
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

    // Parse request body
    const body = await request.json()
    const { objectId, amount, isAutoBid = false, maxAutoBidAmount } = body

    // Validate input
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

    // Fetch object
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

    // Validate object is an auction
    if (object.saleMode !== 'auction') {
      return NextResponse.json(
        { error: 'This object is not in auction mode' },
        { status: 400 }
      )
    }

    // Validate object is active
    if (object.status !== 'active') {
      return NextResponse.json(
        { error: 'This auction is not active' },
        { status: 400 }
      )
    }

    // Validate auction is not ended
    const now = new Date()
    const auctionEndDate = new Date(object.auctionEndDate)

    if (auctionEndDate <= now) {
      return NextResponse.json(
        { error: 'This auction has ended' },
        { status: 400 }
      )
    }

    // Determine current bid amount
    const currentBid = typeof object.currentBidAmount === 'number'
      ? object.currentBidAmount
      : object.auctionStartPrice

    // Validate bid amount using auction helper
    const validation = isValidBid(amount, currentBid, object.reservePrice)

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Create bid
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
      overrideAccess: true, // Bypass access control (already verified user is professionnel above)
    })

    // Check if auction should be extended
    const shouldExtend = shouldExtendAuction(auctionEndDate)
    const newEndDate = shouldExtend ? extendAuction(auctionEndDate) : auctionEndDate

    // Update object
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
      overrideAccess: true, // Bypass access control
    })

    // Send email notification to previous bidder (if exists)
    if (object.currentBidder && object.currentBidder !== user.id) {
      try {
        const { auctionOutbidTemplate, sendEmail } = await import('@/lib/email/templates')

        // Extract previous bidder ID (can be string or object)
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
        // Don't fail the bid if email fails
      }
    }

    // Send email notification to seller about new bid
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
          bidderName: user.firstName, // Only first name for privacy
          sellerName: seller.firstName,
        })
        await sendEmail(seller.email, 'Nouvelle enchère sur votre objet !', html)
      }
    } catch (emailError) {
      console.error('Error sending seller notification email:', emailError)
      // Don't fail the bid if email fails
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
