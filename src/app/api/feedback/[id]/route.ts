import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * Route pour modifier un avis
 * PUT /api/feedback/:id
 * - Un utilisateur peut modifier ses propres avis
 * - Un admin peut modifier n'importe quel avis
 */
export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const payload = await getPayload({ config })
    
    // Vérifier l'authentification
    const { user } = await payload.auth({ headers: req.headers })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const feedbackId = parseInt(params.id)
    
    if (isNaN(feedbackId)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { stars, npsScore, comment } = body

    // Validation des données
    if (stars !== undefined && (stars < 1 || stars > 5)) {
      return NextResponse.json(
        { error: 'La note étoiles doit être entre 1 et 5' },
        { status: 400 }
      )
    }

    if (npsScore !== undefined && (npsScore < 1 || npsScore > 10)) {
      return NextResponse.json(
        { error: 'La note NPS doit être entre 1 et 10' },
        { status: 400 }
      )
    }

    // Récupérer l'avis pour vérifier les permissions
    const feedback = await payload.findByID({
      collection: 'feedback',
      id: feedbackId,
    })

    if (!feedback) {
      return NextResponse.json(
        { error: 'Avis non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier les permissions
    const isOwner = typeof feedback.user === 'object' 
      ? feedback.user.id === user.id 
      : feedback.user === user.id
    const isAdmin = user.role === 'admin'

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas la permission de modifier cet avis' },
        { status: 403 }
      )
    }

    // Mettre à jour l'avis
    const updatedFeedback = await payload.update({
      collection: 'feedback',
      id: feedbackId,
      data: {
        ...(stars !== undefined && { stars }),
        ...(npsScore !== undefined && { npsScore }),
        ...(comment !== undefined && { comment }),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Avis modifié avec succès',
      feedback: {
        id: updatedFeedback.id,
        stars: updatedFeedback.stars,
        npsScore: updatedFeedback.npsScore,
        comment: updatedFeedback.comment,
        createdAt: updatedFeedback.createdAt,
        updatedAt: updatedFeedback.updatedAt,
      },
    })
  } catch (error: any) {
    console.error('Erreur modification feedback:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modification de l\'avis', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * Route pour supprimer un avis
 * DELETE /api/feedback/:id
 * - Un utilisateur peut supprimer ses propres avis
 * - Un admin peut supprimer n'importe quel avis
 */
export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const payload = await getPayload({ config })
    
    // Vérifier l'authentification
    const { user } = await payload.auth({ headers: req.headers })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const feedbackId = parseInt(params.id)
    
    if (isNaN(feedbackId)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      )
    }

    // Récupérer l'avis pour vérifier les permissions
    const feedback = await payload.findByID({
      collection: 'feedback',
      id: feedbackId,
    })

    if (!feedback) {
      return NextResponse.json(
        { error: 'Avis non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier les permissions
    // L'utilisateur doit être soit le propriétaire, soit un admin
    const isOwner = typeof feedback.user === 'object' 
      ? feedback.user.id === user.id 
      : feedback.user === user.id
    const isAdmin = user.role === 'admin'

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas la permission de supprimer cet avis' },
        { status: 403 }
      )
    }

    // Supprimer l'avis
    await payload.delete({
      collection: 'feedback',
      id: feedbackId,
    })

    return NextResponse.json({
      success: true,
      message: 'Avis supprimé avec succès',
    })
  } catch (error: any) {
    console.error('Erreur suppression feedback:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'avis', details: error.message },
      { status: 500 }
    )
  }
}
