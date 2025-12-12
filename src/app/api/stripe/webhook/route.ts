import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
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
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string
        const customerId = invoice.customer as string

        // Retrouver l'utilisateur
        const users = await payload.find({
          collection: 'users',
          where: {
            stripeCustomerId: { equals: customerId },
          },
          limit: 1,
        })

        if (users.docs.length > 0) {
          const user = users.docs[0]

          // Calculer nouvelle date de fin (+1 mois ou période courante)
          // Stripe gère la période, on peut récupérer la subscription pour être précis
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const currentPeriodEnd = new Date(subscription.current_period_end * 1000)

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

          // Mettre à jour ou créer l'enregistrement dans la collection 'subscriptions' si nécessaire
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
                paymentMethod: 'card', // On suppose carte
                amount: invoice.amount_paid / 100
              }
            })
          }
        }
        break
      }

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
              subscriptionStatus: 'canceled', // ou expired
            },
          })
        }
        break
      }

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
          // On pourrait notifier l'utilisateur ici
          await payload.update({
            collection: 'users',
            id: user.id,
            data: {
              hasValidPaymentMethod: false,
              // On ne change pas forcément le statut tout de suite, Stripe réessaie
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
