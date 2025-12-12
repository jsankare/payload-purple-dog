import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * PUT /api/offers/[id]/reject
 * 
 * Reject an offer (seller only)
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
        { error: 'Only the seller can reject this offer' },
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

    // Update offer status
    const updatedOffer = await payload.update({
      collection: 'offers',
      id: offer.id,
      data: {
        status: 'rejected',
      },
    })

    return NextResponse.json(updatedOffer, { status: 200 })
  } catch (error) {
    console.error('Error rejecting offer:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
