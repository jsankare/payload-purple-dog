import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * Route pour récupérer ses propres avis
 * GET /api/feedback/my-feedback
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

    // Récupérer tous les feedbacks de l'utilisateur
    const feedbacks = await payload.find({
      collection: 'feedback',
      where: {
        user: {
          equals: user.id,
        },
      },
      sort: '-createdAt',
      limit: 100,
    })

    return NextResponse.json({
      success: true,
      feedbacks: feedbacks.docs.map(feedback => ({
        id: feedback.id,
        stars: feedback.stars,
        npsScore: feedback.npsScore,
        comment: feedback.comment,
        createdAt: feedback.createdAt,
        updatedAt: feedback.updatedAt,
      })),
      total: feedbacks.totalDocs,
    })
  } catch (error: any) {
    console.error('Erreur récupération feedbacks:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des avis', details: error.message },
      { status: 500 }
    )
  }
}
