import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * GET /api/transactions/[id]
 * 
 * Get a single transaction by ID
 * User must be buyer, seller, or admin
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = await getPayload({ config: configPromise })

    // Get authenticated user
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch transaction
    const transaction = await payload.findByID({
      collection: 'transactions',
      id,
      depth: 2,
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Verify user has access (buyer, seller, or admin)
    const buyerId = typeof transaction.buyer === 'object' ? transaction.buyer.id : transaction.buyer
    const sellerId = typeof transaction.seller === 'object' ? transaction.seller.id : transaction.seller

    if (user.role !== 'admin' && user.id !== buyerId && user.id !== sellerId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    return NextResponse.json(transaction, { status: 200 })
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
