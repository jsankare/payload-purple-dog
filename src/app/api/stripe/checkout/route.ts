import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { createCheckoutSession } from '@/lib/stripe'

/**
 * POST /api/stripe/checkout
 * Create Stripe checkout session for professional subscription
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body = await req.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId required' },
        { status: 400 }
      )
    }

    const user = await payload.findByID({
      collection: 'users',
      id: userId,
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.role !== 'professionnel') {
      return NextResponse.json(
        { error: 'Only professionals can subscribe to this plan' },
        { status: 403 }
      )
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Stripe customer not found' },
        { status: 400 }
      )
    }

    const plans = await payload.find({
      collection: 'plans',
      where: {
        slug: {
          equals: 'professionnel',
        },
      },
      limit: 1,
    })

    if (plans.docs.length === 0) {
      return NextResponse.json(
        { error: 'Professional plan not found' },
        { status: 404 }
      )
    }

    const plan = plans.docs[0]

    const priceId = process.env.STRIPE_PRICE_ID_PROFESSIONAL || 'price_test_dev'

    const session = await createCheckoutSession(
      user.stripeCustomerId,
      priceId,
      user.id,
      plan.id
    )

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })

  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create payment session', details: error.message },
      { status: 500 }
    )
  }
}
