import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * Route pour gérer les préférences de notifications
 * PUT /api/profile/notifications
 * PATCH /api/profile/notifications
 */
async function updateNotifications(req: NextRequest) {
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

// Export PUT and PATCH methods
export async function PUT(req: NextRequest) {
  return updateNotifications(req)
}

export async function PATCH(req: NextRequest) {
  return updateNotifications(req)
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

// Handle OPTIONS for CORS preflight
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:4000',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  })
}
