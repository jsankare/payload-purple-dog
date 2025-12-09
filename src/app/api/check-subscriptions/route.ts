import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * Endpoint pour vérifier les abonnements expirés et restreindre les comptes
 * À exécuter via un cron job quotidien
 */
export async function POST() {
  try {
    const payload = await getPayload({ config })
    const now = new Date()

    // Trouver tous les abonnements en période d'essai
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

    // Vérifier chaque abonnement
    for (const subscription of trialingSubscriptions.docs) {
      try {
        const trialEnd = subscription.trialEnd ? new Date(subscription.trialEnd) : null

        // Si la période d'essai est expirée
        if (trialEnd && now > trialEnd) {
          const userId = typeof subscription.user === 'object' ? subscription.user.id : subscription.user

          // Récupérer l'utilisateur
          const user = await payload.findByID({
            collection: 'users',
            id: userId,
          })

          // Vérifier s'il a payé (s'il a un stripeSubscriptionId actif)
          if (user.stripeSubscriptionId) {
            // L'utilisateur a payé, passer en mode actif
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
            // L'utilisateur n'a pas payé, restreindre le compte
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
 * Endpoint GET pour vérifier le statut d'un utilisateur spécifique
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

    // Vérifier le statut de l'abonnement
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
    
    // Pour les professionnels sans abonnement, calculer trial automatique basé sur date d'inscription
    let effectiveStatus = user.subscriptionStatus
    let autoTrialEnd = null
    
    if (user.role === 'professionnel' && !user.subscriptionStatus) {
      const createdAt = new Date(user.createdAt)
      const trialEndDate = new Date(createdAt)
      trialEndDate.setDate(trialEndDate.getDate() + 30) // 30 jours d'essai
      
      autoTrialEnd = trialEndDate
      
      // Si moins de 30 jours depuis l'inscription, donner accès trial
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
      canView: true, // Tous peuvent voir
    })

  } catch (error: any) {
    console.error('Erreur lors de la vérification:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification', details: error.message },
      { status: 500 }
    )
  }
}
