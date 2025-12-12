import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * POST /api/init-plans
 * Initialize subscription plans (Particulier & Professionnel)
 * 
 * GET /api/init-plans
 * List all subscription plans
 */
export async function POST() {
  try {
    const payload = await getPayload({ config })

    const existingPlans = await payload.find({
      collection: 'plans',
      limit: 1,
    })

    if (existingPlans.totalDocs > 0) {
      return NextResponse.json({
        message: 'Plans already initialized',
        count: existingPlans.totalDocs,
      })
    }

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
          { feature: 'Accès limité à la plateforme' },
          { feature: 'Publication d\'annonces' },
          { feature: 'Protection des venduers' },
        ],
        isActive: true,
        isDefault: true,
      },
    })

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
          { feature: 'Protection des acheteurs' },
        ],
        isActive: true,
        isDefault: true,
      },
    })

    return NextResponse.json({
      message: 'Plans initialized successfully',
      plans: {
        particulier: particulierPlan,
        professionnel: professionnelPlan,
      },
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error initializing plans:', error)
    return NextResponse.json({
      error: 'Failed to initialize plans',
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
      message: 'Plans list',
      plans: plans.docs,
      total: plans.totalDocs,
    })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to fetch plans',
      details: error.message,
    }, { status: 500 })
  }
}
