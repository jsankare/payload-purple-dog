import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { createCheckoutSession } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body = await req.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId requis' },
        { status: 400 }
      )
    }

    // Récupérer l'utilisateur
    const user = await payload.findByID({
      collection: 'users',
      id: userId,
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    if (user.role !== 'professionnel') {
      return NextResponse.json(
        { error: 'Seuls les professionnels peuvent souscrire à ce forfait' },
        { status: 403 }
      )
    }

    // Vérifier que l'utilisateur a un stripeCustomerId
    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Customer Stripe non trouvé' },
        { status: 400 }
      )
    }

    // Récupérer le forfait professionnel
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
        { error: 'Forfait professionnel non trouvé' },
        { status: 404 }
      )
    }

    const plan = plans.docs[0]

    // Créer un price Stripe si nécessaire (en mode dev, utiliser un price_id test)
    // En production, vous devrez créer les Price dans Stripe Dashboard
    const priceId = process.env.STRIPE_PRICE_ID_PROFESSIONAL || 'price_test_dev'

    // Créer la session de checkout
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
    console.error('Erreur création session checkout:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement', details: error.message },
      { status: 500 }
    )
  }
}
