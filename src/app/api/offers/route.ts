import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { newOfferTemplate, sendEmail } from '@/lib/email/templates'

/**
 * POST /api/offers
 * Create an offer on a quick_sale object
 * Body:
 * - objectId: string
 * - amount: number
 * - message?: string
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (user.role !== 'professionnel') {
      return NextResponse.json(
        { error: 'Only professionals can make offers' },
        { status: 403 }
      )
    }

    if (user.subscriptionStatus !== 'active' && user.subscriptionStatus !== 'trialing') {
      return NextResponse.json(
        { error: 'Active subscription required to make offers' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { objectId, amount, message } = body

    if (!objectId || !amount) {
      return NextResponse.json(
        { error: 'objectId and amount are required' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    let object
    try {
      object = await payload.findByID({
        collection: 'objects',
        id: objectId,
      })
    } catch (error) {
      return NextResponse.json(
        { error: 'Object not found' },
        { status: 404 }
      )
    }

    if (object.saleMode !== 'quick_sale') {
      return NextResponse.json(
        { error: 'This object is not in quick sale mode' },
        { status: 400 }
      )
    }

    if (object.status !== 'active') {
      return NextResponse.json(
        { error: 'This object is not available for offers' },
        { status: 400 }
      )
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    const offer = await payload.create({
      collection: 'offers',
      data: {
        object: object.id,
        buyer: user.id,
        amount,
        message: message || '',
        status: 'pending',
        expiresAt,
      },
    })

    /** Send email notification to seller */
    try {
      if (object.seller) {
        const seller = await payload.findByID({
          collection: 'users',
          id: typeof object.seller === 'string' ? object.seller : object.seller.id,
        })

        const html = newOfferTemplate({
          objectName: object.name,
          objectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'}/objects/${object.id}`,
          offerAmount: amount,
          buyerName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          sellerName: `${seller.firstName || ''} ${seller.lastName || ''}`.trim() || seller.email,
        })

        await sendEmail(seller.email, 'Nouvelle offre reçue !', html)
      }
    } catch (emailError) {
      console.error('Error sending offer notification email:', emailError)
    }

    return NextResponse.json(offer, { status: 201 })
  } catch (error) {
    console.error('Error creating offer:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
