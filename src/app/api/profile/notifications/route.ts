import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * Route pour gérer les préférences de notifications
 * PUT /api/profile/notifications
 */
export async function PUT(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    // Vérifier l'authentification
    const { user } = await payload.auth({ headers: req.headers })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { newsletterSubscription } = body

    // Validation
    if (newsletterSubscription === undefined) {
      return NextResponse.json(
        { error: 'Préférence de newsletter requise' },
        { status: 400 }
      )
    }

    // Mettre à jour les préférences
    const updatedUser = await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        newsletterSubscription: newsletterSubscription,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Préférences de notifications mises à jour',
      notifications: {
        newsletterSubscription: updatedUser.newsletterSubscription,
      },
    })
  } catch (error: any) {
    console.error('Erreur mise à jour notifications:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des préférences', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * Récupérer les préférences de notifications
 * GET /api/profile/notifications
 */
export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    // Vérifier l'authentification
    const { user } = await payload.auth({ headers: req.headers })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      notifications: {
        newsletterSubscription: user.newsletterSubscription || false,
      },
    })
  } catch (error: any) {
    console.error('Erreur récupération notifications:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des préférences', details: error.message },
      { status: 500 }
    )
  }
}
