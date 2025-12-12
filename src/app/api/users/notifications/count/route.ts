import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * GET /api/users/notifications/count
 * Returns notification counts for seller: pending offers, new bids, messages
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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

    const pendingOffers = await payload.find({
      collection: 'offers',
      where: {
        object: { in: objectIds },
        status: { equals: 'pending' },
        amount: { greater_than: 0 },
      },
      limit: 1000,
    })

    /** Messages are offers with amount = 0 */
    const newMessages = await payload.find({
      collection: 'offers',
      where: {
        object: { in: objectIds },
        amount: { equals: 0 },
      },
      limit: 1000,
    })

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
