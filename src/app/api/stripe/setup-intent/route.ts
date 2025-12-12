import { stripe, createStripeCustomer } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * POST /api/stripe/setup-intent
 * 
 * Create a Setup Intent for adding a payment method
 * Required for professionals to bid on auctions
 * Automatically creates Stripe customer if missing
 */
export async function POST(request: NextRequest) {
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

    // Only professionals need payment methods to bid
    if (user.role !== 'professionnel') {
      return NextResponse.json(
        { error: 'Only professionals can add payment methods' },
        { status: 403 }
      )
    }

    // Check if user has Stripe customer ID, create if missing
    let customerId = user.stripeCustomerId

    if (!customerId) {
      console.log('Creating Stripe customer for user:', user.email)

      // Create Stripe customer automatically
      const customer = await createStripeCustomer(
        user.email,
        `${user.firstName} ${user.lastName}`,
        user.id
      )

      console.log('Stripe customer created:', customer.id)

      // Update user with Stripe customer ID
      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          stripeCustomerId: customer.id,
        },
        overrideAccess: true,
      })

      customerId = customer.id
    }

    // Create Setup Intent
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      metadata: {
        userId: user.id.toString(),
      },
    })

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
    }, { status: 200 })
  } catch (error) {
    console.error('Error creating setup intent:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
