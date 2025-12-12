import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * GET /api/feedback/my-feedback
 * Returns user's own feedback
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
    console.error('Error fetching feedback:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback', details: error.message },
      { status: 500 }
    )
  }
}
