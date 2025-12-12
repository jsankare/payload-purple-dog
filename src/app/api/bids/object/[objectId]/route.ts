import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * GET /api/bids/object/[objectId]
 * Returns bid history for specific object
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ objectId: string }> }
) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { objectId } = await params

    const result = await payload.find({
      collection: 'bids',
      where: {
        object: { equals: objectId },
      },
      sort: '-createdAt',
      limit: 100,
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
