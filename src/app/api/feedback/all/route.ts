import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * GET /api/feedback/all
 * Returns all feedback (Admin only)
 */
export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config })

    const { user } = await payload.auth({ headers: req.headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin only.' },
        { status: 403 }
      )
    }

    const feedbacks = await payload.find({
      collection: 'feedback',
      sort: '-createdAt',
      limit: 1000,
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
    console.error('Error fetching all feedback:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback', details: error.message },
      { status: 500 }
    )
  }
}
