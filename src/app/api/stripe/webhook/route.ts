/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events for subscription lifecycle
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-11-17.clover',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  let event: Stripe.Event

  try {
    if (!endpointSecret || !sig) {
      throw new Error('Missing webhook secret or signature')
    }
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })

  try {
    switch (event.type) {
      /** Handle successful subscription payment */
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | Stripe.Subscription
          payment_intent?: string | Stripe.PaymentIntent | null
        }
        const subscriptionId = typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription?.id
        const customerId = invoice.customer as string

        if (!subscriptionId) {
          console.error('No subscription ID found on invoice')
          break
        }

        const users = await payload.find({
          collection: 'users',
          where: {
            stripeCustomerId: { equals: customerId },
          },
          limit: 1,
        })

        if (users.docs.length > 0) {
          const user = users.docs[0]

          /** Calculate new subscription end date from Stripe period */
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000)

          await payload.update({
            collection: 'users',
            id: user.id,
            data: {
              subscriptionStatus: 'active',
              subscriptionEndDate: currentPeriodEnd.toISOString(),
              stripeSubscriptionId: subscriptionId,
              stripePaymentMethodId: invoice.payment_intent as string || undefined,
              hasValidPaymentMethod: true,
            },
          })

          /** Update existing subscription record if present */
          const existingSubs = await payload.find({
            collection: 'subscriptions',
            where: {
              user: { equals: user.id },
              status: { equals: 'active' }
            },
            limit: 1
          })

          if (existingSubs.docs.length > 0) {
            const sub = existingSubs.docs[0]
            await payload.update({
              collection: 'subscriptions',
              id: sub.id,
              data: {
                currentPeriodEnd: currentPeriodEnd.toISOString(),
                status: 'active',
                paymentMethod: 'card',
                amount: invoice.amount_paid / 100
              }
            })
          }
        }
        break
      }

      /** Handle subscription cancellation */
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const users = await payload.find({
          collection: 'users',
          where: {
            stripeCustomerId: { equals: customerId },
          },
          limit: 1,
        })

        if (users.docs.length > 0) {
          const user = users.docs[0]
          await payload.update({
            collection: 'users',
            id: user.id,
            data: {
              subscriptionStatus: 'canceled',
            },
          })
        }
        break
      }

      /** Handle failed payment - mark payment method as invalid */
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const users = await payload.find({
          collection: 'users',
          where: {
            stripeCustomerId: { equals: customerId },
          },
          limit: 1,
        })

        if (users.docs.length > 0) {
          const user = users.docs[0]
          await payload.update({
            collection: 'users',
            id: user.id,
            data: {
              hasValidPaymentMethod: false,
            },
          })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
