import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * POST /api/check-subscriptions
 * Checks expired subscriptions and restricts accounts (cron job)
 */
export async function POST() {
  try {
    const payload = await getPayload({ config })
    const now = new Date()

    const trialingSubscriptions = await payload.find({
      collection: 'subscriptions',
      where: {
        status: {
          equals: 'trialing',
        },
      },
      limit: 1000,
    })

    let restrictedCount = 0
    let errors: string[] = []

    for (const subscription of trialingSubscriptions.docs) {
      try {
        const trialEnd = subscription.trialEnd ? new Date(subscription.trialEnd) : null

        if (trialEnd && now > trialEnd) {
          const userId = typeof subscription.user === 'object' ? subscription.user.id : subscription.user

          const user = await payload.findByID({
            collection: 'users',
            id: userId,
          })

          /** User has paid - activate subscription */
          if (user.stripeSubscriptionId) {
            await payload.update({
              collection: 'subscriptions',
              id: subscription.id,
              data: {
                status: 'active',
              },
            })

            await payload.update({
              collection: 'users',
              id: userId,
              data: {
                subscriptionStatus: 'active',
              },
            })

            console.log(`✅ Abonnement activé pour ${user.email}`)
          } else {
            /** User hasn't paid - restrict account */
            await payload.update({
              collection: 'subscriptions',
              id: subscription.id,
              data: {
                status: 'expired',
              },
            })

            await payload.update({
              collection: 'users',
              id: userId,
              data: {
                subscriptionStatus: 'restricted',
              },
            })

            restrictedCount++
            console.log(`⚠️ Compte restreint pour ${user.email} (essai expiré sans paiement)`)
          }
        }
      } catch (error: any) {
        errors.push(`Erreur pour subscription ${subscription.id}: ${error.message}`)
        console.error(`Erreur traitement subscription ${subscription.id}:`, error)
      }
    }

    return NextResponse.json({
      message: 'Vérification des abonnements terminée',
      checked: trialingSubscriptions.docs.length,
      restricted: restrictedCount,
      errors: errors.length > 0 ? errors : undefined,
    })

  } catch (error: any) {
    console.error('Erreur lors de la vérification des abonnements:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/check-subscriptions
 * Checks subscription status for specific user
 * @param userId - User ID to check
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId requis' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config })

    const user = await payload.findByID({
      collection: 'users',
      id: parseInt(userId),
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    let subscriptionDetails = null
    if (user.currentSubscription) {
      const subId = typeof user.currentSubscription === 'object'
        ? user.currentSubscription.id
        : user.currentSubscription

      subscriptionDetails = await payload.findByID({
        collection: 'subscriptions',
        id: subId,
      })
    }

    const now = new Date()
    const trialEnd = subscriptionDetails?.trialEnd ? new Date(subscriptionDetails.trialEnd) : null
    const isTrialExpired = trialEnd ? now > trialEnd : false

    /** Auto-calculate trial for professionals without subscription (30 days from signup) */
    let effectiveStatus = user.subscriptionStatus
    let autoTrialEnd = null

    if (user.role === 'professionnel' && !user.subscriptionStatus) {
      const createdAt = new Date(user.createdAt)
      const trialEndDate = new Date(createdAt)
      trialEndDate.setDate(trialEndDate.getDate() + 30)

      autoTrialEnd = trialEndDate

      if (now < trialEndDate) {
        effectiveStatus = 'trialing'
      } else {
        effectiveStatus = 'restricted'
      }
    }

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      role: user.role,
      subscriptionStatus: effectiveStatus,
      subscription: subscriptionDetails ? {
        status: subscriptionDetails.status,
        trialEnd: subscriptionDetails.trialEnd,
        isTrialExpired,
        currentPeriodEnd: subscriptionDetails.currentPeriodEnd,
      } : (autoTrialEnd ? {
        status: 'trialing',
        trialEnd: autoTrialEnd.toISOString(),
        isTrialExpired: now > autoTrialEnd,
        currentPeriodEnd: autoTrialEnd.toISOString(),
        autoGenerated: true,
      } : null),
      canPurchase: effectiveStatus === 'active' || effectiveStatus === 'trialing',
      canSell: effectiveStatus === 'active' || effectiveStatus === 'trialing',
      canView: true,
    })

  } catch (error: any) {
    console.error('Erreur lors de la vérification:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification', details: error.message },
      { status: 500 }
    )
  }
}
