import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * GET /api/bids/object/[objectId]
 * 
 * Get bid history for a specific object
 * 
 * @param params.objectId - Object ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ objectId: string }> }
) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { objectId } = await params

    // Fetch bids for this object
    const result = await payload.find({
      collection: 'bids',
      where: {
        object: { equals: objectId },
      },
      sort: '-createdAt',
      limit: 100, // Limit to last 100 bids
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Error fetching bid history:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
