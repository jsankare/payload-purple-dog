import { stripe } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * GET /api/stripe/payment-methods
 * Returns all payment methods for authenticated user
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

    if (!user.stripeCustomerId) {
      return NextResponse.json({ paymentMethods: [] }, { status: 200 })
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card',
    })

    return NextResponse.json({
      paymentMethods: paymentMethods.data,
    }, { status: 200 })
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/stripe/payment-methods
 * Attaches payment method to user's Stripe customer and sets as default
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

    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer ID found' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { paymentMethodId } = body

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      )
    }

    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: user.stripeCustomerId,
    })

    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })

    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        stripePaymentMethodId: paymentMethodId,
        hasValidPaymentMethod: true,
      },
      overrideAccess: true,
    })

    return NextResponse.json({
      success: true,
      message: 'Payment method added successfully',
    }, { status: 200 })
  } catch (error) {
    console.error('Error attaching payment method:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/stripe/payment-methods
 * Detaches payment method from user
 */
export async function DELETE(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const paymentMethodId = searchParams.get('id')

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      )
    }

    await stripe.paymentMethods.detach(paymentMethodId)

    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        stripePaymentMethodId: null,
        hasValidPaymentMethod: false,
      },
      overrideAccess: true,
    })

    return NextResponse.json({
      success: true,
      message: 'Payment method removed successfully',
    }, { status: 200 })
  } catch (error) {
    console.error('Error detaching payment method:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
