import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * Route pour soumettre un avis sur la plateforme
 * POST /api/feedback/submit
 */
export async function POST(req: NextRequest) {
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
    const { stars, npsScore, comment } = body

    // Validation
    if (!stars || !npsScore) {
      return NextResponse.json(
        { error: 'Les notes étoiles et NPS sont requises' },
        { status: 400 }
      )
    }

    if (stars < 1 || stars > 5) {
      return NextResponse.json(
        { error: 'La note étoiles doit être entre 1 et 5' },
        { status: 400 }
      )
    }

    if (npsScore < 1 || npsScore > 10) {
      return NextResponse.json(
        { error: 'La note NPS doit être entre 1 et 10' },
        { status: 400 }
      )
    }

    // Créer le feedback
    const feedback = await payload.create({
      collection: 'feedback',
      data: {
        user: user.id,
        stars,
        npsScore,
        comment: comment || '',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Merci pour votre avis ! Il est maintenant visible.',
      feedback: {
        id: feedback.id,
        stars: feedback.stars,
        npsScore: feedback.npsScore,
        comment: feedback.comment,
        createdAt: feedback.createdAt,
      },
    })
  } catch (error: any) {
    console.error('Erreur soumission feedback:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la soumission de l\'avis', details: error.message },
      { status: 500 }
    )
  }
}
