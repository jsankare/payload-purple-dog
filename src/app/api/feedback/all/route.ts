import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * Route pour récupérer tous les avis (Admin uniquement)
 * GET /api/feedback/all
 * Retourne tous les avis de tous les utilisateurs
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

    // Vérifier que l'utilisateur est admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès refusé. Admin uniquement.' },
        { status: 403 }
      )
    }

    // Récupérer tous les avis avec les infos utilisateur
    const feedbacks = await payload.find({
      collection: 'feedback',
      sort: '-createdAt',
      limit: 1000, // Limite raisonnable
    })

    return NextResponse.json({
      success: true,
      feedbacks: feedbacks.docs.map((feedback) => ({
        id: feedback.id,
        stars: feedback.stars,
        npsScore: feedback.npsScore,
        comment: feedback.comment,
        user: typeof feedback.user === 'object' ? {
          id: feedback.user.id,
          email: feedback.user.email,
          firstName: feedback.user.firstName,
          lastName: feedback.user.lastName,
        } : feedback.user,
        createdAt: feedback.createdAt,
        updatedAt: feedback.updatedAt,
      })),
      total: feedbacks.totalDocs,
    })
  } catch (error: any) {
    console.error('Erreur récupération tous les avis:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des avis', details: error.message },
      { status: 500 }
    )
  }
}
