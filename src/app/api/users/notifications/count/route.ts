import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * GET /api/users/notifications/count
 * 
 * Get notification count for current user (seller)
 * Returns count of:
 * - Pending offers on user's objects
 * - New bids on user's objects
 * - New messages (offers with amount = 0)
 */
export async function GET(request: NextRequest) {
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

    // Get all user's objects
    const userObjects = await payload.find({
      collection: 'objects',
      where: {
        seller: { equals: user.id },
        status: { equals: 'active' },
      },
      limit: 1000,
    })

    const objectIds = userObjects.docs.map(obj => obj.id)

    if (objectIds.length === 0) {
      return NextResponse.json({
        newOffers: 0,
        newBids: 0,
        newMessages: 0,
        total: 0,
      })
    }

    // Count pending offers (excluding messages)
    const pendingOffers = await payload.find({
      collection: 'offers',
      where: {
        object: { in: objectIds },
        status: { equals: 'pending' },
        amount: { greater_than: 0 },
      },
      limit: 1000,
    })

    // Count new messages (offers with amount = 0)
    const newMessages = await payload.find({
      collection: 'offers',
      where: {
        object: { in: objectIds },
        amount: { equals: 0 },
      },
      limit: 1000,
    })

    // Count new bids (bids created after user's last login)
    // For simplicity, count all bids on user's auction objects
    const auctionObjects = userObjects.docs.filter(obj => obj.saleMode === 'auction')
    const auctionObjectIds = auctionObjects.map(obj => obj.id)

    let newBidsCount = 0
    if (auctionObjectIds.length > 0) {
      const bids = await payload.find({
        collection: 'bids',
        where: {
          object: { in: auctionObjectIds },
        },
        limit: 1000,
      })
      newBidsCount = bids.docs.length
    }

    const total = pendingOffers.docs.length + newMessages.docs.length + newBidsCount

    return NextResponse.json({
      newOffers: pendingOffers.docs.length,
      newBids: newBidsCount,
      newMessages: newMessages.docs.length,
      total,
    })
  } catch (error) {
    console.error('Error fetching notification count:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
