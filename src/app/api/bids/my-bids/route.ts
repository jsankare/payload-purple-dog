import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * GET /api/bids/my-bids
 * Returns all bids placed by authenticated user
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

    const result = await payload.find({
      collection: 'bids',
      where: {
        bidder: { equals: user.id },
      },
      sort: '-createdAt',
      depth: 2,
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Error fetching user bids:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
