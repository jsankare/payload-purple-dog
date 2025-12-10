import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * Route pour récupérer les statistiques des avis (Admin uniquement)
 * GET /api/feedback/stats
 */
export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    // Vérifier l'authentification et le rôle admin
    const { user } = await payload.auth({ headers: req.headers })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès refusé. Admin uniquement.' },
        { status: 403 }
      )
    }

    // Récupérer tous les feedbacks
    const allFeedbacks = await payload.find({
      collection: 'feedback',
      limit: 10000, // Limite élevée pour avoir toutes les stats
    })

    const feedbacks = allFeedbacks.docs

    // Calculer les statistiques
    const totalFeedbacks = feedbacks.length
    
    // Moyenne des étoiles
    const avgStars = totalFeedbacks > 0
      ? feedbacks.reduce((sum, f) => sum + (f.stars || 0), 0) / totalFeedbacks
      : 0

    // Moyenne NPS
    const avgNps = totalFeedbacks > 0
      ? feedbacks.reduce((sum, f) => sum + (f.npsScore || 0), 0) / totalFeedbacks
      : 0

    // Distribution des étoiles
    const starsDistribution = {
      1: feedbacks.filter(f => f.stars === 1).length,
      2: feedbacks.filter(f => f.stars === 2).length,
      3: feedbacks.filter(f => f.stars === 3).length,
      4: feedbacks.filter(f => f.stars === 4).length,
      5: feedbacks.filter(f => f.stars === 5).length,
    }

    // Catégories NPS
    const promoters = feedbacks.filter(f => f.npsScore >= 9).length
    const passives = feedbacks.filter(f => f.npsScore >= 7 && f.npsScore <= 8).length
    const detractors = feedbacks.filter(f => f.npsScore <= 6).length
    
    // Score NPS final (% promoters - % detractors)
    const npsScore = totalFeedbacks > 0
      ? ((promoters - detractors) / totalFeedbacks) * 100
      : 0

    // Feedbacks récents (5 derniers)
    const recentFeedbacks = feedbacks
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(f => ({
        id: f.id,
        stars: f.stars,
        npsScore: f.npsScore,
        comment: f.comment ? (f.comment.length > 100 ? f.comment.substring(0, 100) + '...' : f.comment) : '',
        createdAt: f.createdAt,
        user: f.user,
      }))

    return NextResponse.json({
      success: true,
      stats: {
        total: totalFeedbacks,
        averageStars: Math.round(avgStars * 10) / 10,
        averageNps: Math.round(avgNps * 10) / 10,
        npsScore: Math.round(npsScore),
        starsDistribution,
        npsCategories: {
          promoters,
          passives,
          detractors,
        },
      },
      recentFeedbacks,
    })
  } catch (error: any) {
    console.error('Erreur récupération stats:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques', details: error.message },
      { status: 500 }
    )
  }
}
