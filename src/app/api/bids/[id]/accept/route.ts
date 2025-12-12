import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * POST /api/bids/[id]/accept
 * Accept bid manually (seller only) - creates transaction, marks sold, notifies users
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

    const bid = await payload.findByID({
      collection: 'bids',
      id,
      depth: 2,
    })

    if (!bid) {
      return NextResponse.json(
        { error: 'Bid not found' },
        { status: 404 }
      )
    }

    let object
    if (typeof bid.object === 'string') {
      object = await payload.findByID({
        collection: 'objects',
        id: bid.object,
      })
    } else {
      object = bid.object
    }

    const sellerId = typeof object.seller === 'string' ? object.seller : object.seller?.id

    if (user.role !== 'admin' && user.id !== sellerId) {
      return NextResponse.json(
        { error: 'Only the seller can accept bids' },
        { status: 403 }
      )
    }

    if (object.status !== 'active') {
      return NextResponse.json(
        { error: 'Object is no longer available' },
        { status: 400 }
      )
    }

    const buyerId = typeof bid.bidder === 'number' ? bid.bidder : (typeof bid.bidder === 'string' ? bid.bidder : bid.bidder?.id)

    const settings = await payload.findGlobal({ slug: 'settings' })
    const buyerCommissionRate = settings.globalBuyerCommission || 3
    const sellerCommissionRate = settings.globalSellerCommission || 2

    const finalPrice = bid.amount
    const buyerCommission = Math.round(finalPrice * (buyerCommissionRate / 100))
    const sellerCommission = Math.round(finalPrice * (sellerCommissionRate / 100))
    const shippingCost = 0
    const totalAmount = finalPrice + buyerCommission + shippingCost
    const sellerAmount = finalPrice - sellerCommission

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
      overrideAccess: true,
    })

    await payload.update({
      collection: 'objects',
      id: object.id,
      data: {
        status: 'sold',
        soldAt: new Date().toISOString(),
      },
      overrideAccess: true,
    })

    const allBids = await payload.find({
      collection: 'bids',
      where: {
        object: { equals: object.id },
        id: { not_equals: bid.id },
      },
    })

    /** Send email notifications to winner and losers */
    try {
      const { auctionWonTemplate, auctionLostTemplate, sendEmail } = await import('@/lib/email/templates')
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'

      const winner = await payload.findByID({
        collection: 'users',
        id: buyerId,
      })

      const winnerHtml = auctionWonTemplate({
        objectName: object.name,
        objectUrl: `${appUrl}/objets/${object.id}`,
        finalPrice: bid.amount,
        userName: winner.firstName,
        checkoutUrl: `${appUrl}/checkout/${transaction.id}`,
      })
      await sendEmail(winner.email, 'Félicitations ! Vous avez remporté l\'enchère', winnerHtml)

      const loserEmails = new Set<string>()
      for (const loserBid of allBids.docs) {
        const loserId = typeof loserBid.bidder === 'number' ? loserBid.bidder : (typeof loserBid.bidder === 'string' ? loserBid.bidder : loserBid.bidder?.id)
        if (loserId) {
          const loser = await payload.findByID({
            collection: 'users',
            id: loserId,
          })
          loserEmails.add(loser.email)
        }
      }

      for (const email of loserEmails) {
        const loser = await payload.find({
          collection: 'users',
          where: { email: { equals: email } },
          limit: 1,
        })
        if (loser.docs[0]) {
          const loserHtml = auctionLostTemplate({
            objectName: object.name,
            objectUrl: `${appUrl}/objets`,
            userName: loser.docs[0].firstName,
          })
          await sendEmail(email, 'Enchère terminée', loserHtml)
        }
      }
    } catch (emailError) {
      console.error('Error sending bid acceptance emails:', emailError)
    }

    return NextResponse.json({
      message: 'Bid accepted successfully',
      transaction,
    }, { status: 200 })
  } catch (error) {
    console.error('Error accepting bid:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
