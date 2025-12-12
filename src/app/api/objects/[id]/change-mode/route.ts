import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * PATCH /api/objects/[id]/change-mode
 * 
 * Change sale mode (seller only)
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
    const { newMode, price, auctionEndDate } = body

    // Get authenticated user
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate mode
    if (!newMode || !['quick_sale', 'auction'].includes(newMode)) {
      return NextResponse.json(
        { error: 'Invalid sale mode' },
        { status: 400 }
      )
    }

    // Validate price
    if (!price || price <= 0) {
      return NextResponse.json(
        { error: 'Price is required' },
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
        { error: 'Only the seller can change the sale mode' },
        { status: 403 }
      )
    }

    // Check if object is still active
    if (object.status !== 'active') {
      return NextResponse.json(
        { error: 'Cannot change mode of inactive object' },
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
        { error: 'Cannot change mode while there are pending offers' },
        { status: 400 }
      )
    }

    // Check for active bids
    const activeBids = await payload.find({
      collection: 'bids',
      where: {
        object: { equals: id },
      },
      limit: 1,
    })

    if (activeBids.docs.length > 0) {
      return NextResponse.json(
        { error: 'Cannot change mode while there are active bids' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = {
      saleMode: newMode,
    }

    if (newMode === 'quick_sale') {
      updateData.quickSalePrice = price
      // Clear auction fields
      updateData.auctionStartPrice = null
      updateData.auctionEndDate = null
      updateData.reservePrice = null
    } else if (newMode === 'auction') {
      updateData.auctionStartPrice = price
      // Set auction end date (default 7 days if not provided)
      if (auctionEndDate) {
        updateData.auctionEndDate = auctionEndDate
      } else {
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + 7)
        updateData.auctionEndDate = endDate.toISOString()
      }
      // Clear quick sale field
      updateData.quickSalePrice = null
    }

    const updatedObject = await payload.update({
      collection: 'objects',
      id,
      data: updateData,
    })

    return NextResponse.json({
      message: 'Sale mode changed successfully',
      object: updatedObject,
    }, { status: 200 })
  } catch (error) {
    console.error('Error changing sale mode:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
