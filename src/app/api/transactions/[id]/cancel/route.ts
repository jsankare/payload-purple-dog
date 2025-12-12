import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * DELETE /api/transactions/[id]/cancel
 * 
 * Cancel a transaction and restore object to active status
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { id } = await params

    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const transaction = await payload.findByID({
      collection: 'transactions',
      id,
      depth: 1,
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    const buyerId = typeof transaction.buyer === 'object'
      ? transaction.buyer?.id
      : transaction.buyer

    if (user.role !== 'admin' && user.id !== buyerId) {
      return NextResponse.json(
        { error: 'Only the buyer can cancel this transaction' },
        { status: 403 }
      )
    }

    if (transaction.paymentStatus !== 'pending') {
      return NextResponse.json(
        { error: 'Cannot cancel a transaction that has been paid' },
        { status: 400 }
      )
    }

    const objectId = typeof transaction.object === 'object'
      ? transaction.object?.id
      : transaction.object
    await payload.update({
      collection: 'objects',
      id: objectId,
      data: {
        status: 'active',
      },
      overrideAccess: true,
    })

    await payload.delete({
      collection: 'transactions',
      id: transaction.id,
      overrideAccess: true,
    })

    return NextResponse.json({
      message: 'Transaction cancelled successfully',
    }, { status: 200 })
  } catch (error) {
    console.error('Error cancelling transaction:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
