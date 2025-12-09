import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = (await headers()).get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  const payload = await getPayload({ config })

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = parseInt(session.metadata?.userId || '0')
        const planId = parseInt(session.metadata?.planId || '0')

        if (userId && planId && session.subscription) {
          // Calculer les dates
          const now = new Date()
          const periodEnd = new Date(now)
          periodEnd.setMonth(periodEnd.getMonth() + 1)

          // Créer ou mettre à jour l'abonnement
          const subscription = await payload.create({
            collection: 'subscriptions',
            data: {
              user: userId,
              plan: planId,
              status: 'active',
              currentPeriodStart: now.toISOString(),
              currentPeriodEnd: periodEnd.toISOString(),
              autoRenew: true,
              paymentMethod: 'card',
              amount: session.amount_total ? session.amount_total / 100 : 0,
              notes: 'Abonnement activé via Stripe',
            },
          })

          // Mettre à jour l'utilisateur
          await payload.update({
            collection: 'users',
            id: userId,
            data: {
              currentSubscription: subscription.id,
              subscriptionStatus: 'active',
              stripeSubscriptionId: session.subscription as string,
            },
          })

          console.log(`✅ Abonnement activé pour l'utilisateur ${userId}`)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const customerId = subscription.customer as string

        // Trouver l'utilisateur par stripeCustomerId
        const users = await payload.find({
          collection: 'users',
          where: {
            stripeCustomerId: {
              equals: customerId,
            },
          },
          limit: 1,
        })

        if (users.docs.length > 0) {
          const user = users.docs[0]
          const status = subscription.status === 'active' ? 'active' : 
                       subscription.status === 'trialing' ? 'trialing' :
                       subscription.status === 'canceled' ? 'canceled' : 'suspended'

          await payload.update({
            collection: 'users',
            id: user.id,
            data: {
              subscriptionStatus: status,
            },
          })

          console.log(`✅ Statut abonnement mis à jour pour ${user.email}: ${status}`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const customerId = subscription.customer as string

        // Trouver l'utilisateur
        const users = await payload.find({
          collection: 'users',
          where: {
            stripeCustomerId: {
              equals: customerId,
            },
          },
          limit: 1,
        })

        if (users.docs.length > 0) {
          const user = users.docs[0]

          // Passer en mode restreint
          await payload.update({
            collection: 'users',
            id: user.id,
            data: {
              subscriptionStatus: 'restricted',
            },
          })

          console.log(`⚠️ Abonnement annulé - compte restreint pour ${user.email}`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const customerId = invoice.customer as string

        // Trouver l'utilisateur
        const users = await payload.find({
          collection: 'users',
          where: {
            stripeCustomerId: {
              equals: customerId,
            },
          },
          limit: 1,
        })

        if (users.docs.length > 0) {
          const user = users.docs[0]

          // Suspendre temporairement
          await payload.update({
            collection: 'users',
            id: user.id,
            data: {
              subscriptionStatus: 'suspended',
            },
          })

          console.log(`⚠️ Paiement échoué - compte suspendu pour ${user.email}`)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error.message },
      { status: 500 }
    )
  }
}
