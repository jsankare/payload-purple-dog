import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * GET /api/transactions/my-purchases
 * 
 * Get all purchases (transactions where user is buyer)
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

    // Fetch user's purchases
    const result = await payload.find({
      collection: 'transactions',
      where: {
        buyer: {
          equals: user.id,
        },
      },
      sort: '-createdAt',
      depth: 2, // Include object and seller details
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Error fetching purchases:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
