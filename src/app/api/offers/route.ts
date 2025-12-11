import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { newOfferTemplate, sendEmail } from '@/lib/email/templates'

/**
 * POST /api/offers
 * 
 * Create an offer on a quick_sale object
 * 
 * Body:
 * - objectId: string
 * - amount: number
 * - message?: string
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    // Get authenticated user
    // @ts-ignore - Payload injects user in request context
    const user = request.user

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user is professional with active subscription
    if (user.role !== 'professionnel') {
      return NextResponse.json(
        { error: 'Only professionals can make offers' },
        { status: 403 }
      )
    }

    if (user.subscriptionStatus !== 'active') {
      return NextResponse.json(
        { error: 'Active subscription required to make offers' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { objectId, amount, message } = body

    // Validate input
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

    // Fetch object
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

    // Validate object is in quick_sale mode
    if (object.saleMode !== 'quick_sale') {
      return NextResponse.json(
        { error: 'This object is not in quick sale mode' },
        { status: 400 }
      )
    }

    // Validate object is active
    if (object.status !== 'active') {
      return NextResponse.json(
        { error: 'This object is not available for offers' },
        { status: 400 }
      )
    }

    // Calculate expiration date (7 days from now)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    // Create offer
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

    // Send email notification to seller
    try {
      if (object.seller) {
        const seller = await payload.findByID({
          collection: 'users',
          id: typeof object.seller === 'string' ? object.seller : object.seller.id,
        })

        const html = newOfferTemplate({
          objectName: object.name,
          objectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/objects/${object.id}`,
          offerAmount: amount,
          buyerName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          sellerName: `${seller.firstName || ''} ${seller.lastName || ''}`.trim() || seller.email,
        })

        await sendEmail(seller.email, 'Nouvelle offre reçue !', html)
      }
    } catch (emailError) {
      // Log email error but don't fail the request
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
