import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST() {
  try {
    const payload = await getPayload({ config })

    // Vérifier si les forfaits existent déjà
    const existingPlans = await payload.find({
      collection: 'plans',
      limit: 1,
    })

    if (existingPlans.totalDocs > 0) {
      return NextResponse.json({
        message: 'Les forfaits sont déjà initialisés',
        count: existingPlans.totalDocs,
      })
    }

    // Créer le forfait Particulier (gratuit)
    const particulierPlan = await payload.create({
      collection: 'plans',
      data: {
        name: 'Forfait Particulier',
        slug: 'particulier',
        userType: 'particulier',
        price: 0,
        trialPeriodDays: 0,
        description: 'Forfait gratuit pour les particuliers. Accès illimité à la plateforme pour acheter et vendre vos objets de valeur.',
        features: [
          { feature: 'Accès illimité à la plateforme' },
          { feature: 'Publication d\'annonces' },
          { feature: 'Participation aux enchères' },
          { feature: 'Messagerie intégrée' },
          { feature: 'Protection des acheteurs' },
        ],
        isActive: true,
        isDefault: true,
      },
    })

    // Créer le forfait Professionnel (49€/mois avec 1 mois d'essai)
    const professionnelPlan = await payload.create({
      collection: 'plans',
      data: {
        name: 'Forfait Professionnel',
        slug: 'professionnel',
        userType: 'professionnel',
        price: 49,
        trialPeriodDays: 30,
        description: '1 mois gratuit puis 49€/mois. Accès illimité pour les professionnels.',
        features: [
          { feature: 'Accès illimité à la plateforme' },
          { feature: 'Publication illimitée d\'annonces' },
          { feature: 'Enchères illimitées' },
        ],
        isActive: true,
        isDefault: true,
      },
    })

    return NextResponse.json({
      message: 'Forfaits initialisés avec succès',
      plans: {
        particulier: particulierPlan,
        professionnel: professionnelPlan,
      },
    }, { status: 201 })

  } catch (error: any) {
    console.error('Erreur lors de l\'initialisation des forfaits:', error)
    return NextResponse.json({
      error: 'Erreur lors de l\'initialisation des forfaits',
      details: error.message,
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const payload = await getPayload({ config })

    const plans = await payload.find({
      collection: 'plans',
      sort: 'price',
    })

    return NextResponse.json({
      message: 'Liste des forfaits',
      plans: plans.docs,
      total: plans.totalDocs,
    })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Erreur lors de la récupération des forfaits',
      details: error.message,
    }, { status: 500 })
  }
}
