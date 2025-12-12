import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * PATCH /api/objects/[id]/update-price
 * 
 * Update object price (seller only)
 * Only allowed if no pending offers/bids
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { id } = await params
    const body = await request.json()
    const { newPrice } = body

    // Get authenticated user
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate price
    if (!newPrice || newPrice <= 0) {
      return NextResponse.json(
        { error: 'Invalid price' },
        { status: 400 }
      )
    }

    // Fetch object
    const object = await payload.findByID({
      collection: 'objects',
      id,
    })

    if (!object) {
      return NextResponse.json(
        { error: 'Object not found' },
        { status: 404 }
      )
    }

    // Verify user is the seller
    const sellerId = typeof object.seller === 'string' ? object.seller : object.seller?.id

    if (user.role !== 'admin' && user.id !== sellerId) {
      return NextResponse.json(
        { error: 'Only the seller can update the price' },
        { status: 403 }
      )
    }

    // Check if object is still active
    if (object.status !== 'active') {
      return NextResponse.json(
        { error: 'Cannot update price of inactive object' },
        { status: 400 }
      )
    }

    // Check for pending offers
    const pendingOffers = await payload.find({
      collection: 'offers',
      where: {
        object: { equals: id },
        status: { equals: 'pending' },
      },
      limit: 1,
    })

    if (pendingOffers.docs.length > 0) {
      return NextResponse.json(
        { error: 'Cannot update price while there are pending offers' },
        { status: 400 }
      )
    }

    // Check for active bids (if auction)
    if (object.saleMode === 'auction') {
      const activeBids = await payload.find({
        collection: 'bids',
        where: {
          object: { equals: id },
        },
        limit: 1,
      })

      if (activeBids.docs.length > 0) {
        return NextResponse.json(
          { error: 'Cannot update price while there are active bids' },
          { status: 400 }
        )
      }
    }

    // Update price based on sale mode
    const updateData: any = {}
    if (object.saleMode === 'quick_sale') {
      updateData.quickSalePrice = newPrice
    } else if (object.saleMode === 'auction') {
      updateData.auctionStartPrice = newPrice
    }

    const updatedObject = await payload.update({
      collection: 'objects',
      id,
      data: updateData,
    })

    return NextResponse.json({
      message: 'Price updated successfully',
      object: updatedObject,
    }, { status: 200 })
  } catch (error) {
    console.error('Error updating price:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
