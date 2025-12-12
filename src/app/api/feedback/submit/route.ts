import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * POST /api/feedback/submit
 * Submit platform feedback (authenticated users)
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })

    const { user } = await payload.auth({ headers: req.headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { stars, npsScore, comment } = body

    if (!stars || !npsScore) {
      return NextResponse.json(
        { error: 'Star and NPS ratings are required' },
        { status: 400 }
      )
    }

    if (stars < 1 || stars > 5) {
      return NextResponse.json(
        { error: 'Star rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    if (npsScore < 1 || npsScore > 10) {
      return NextResponse.json(
        { error: 'NPS score must be between 1 and 10' },
        { status: 400 }
      )
    }

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
      message: 'Thank you for your feedback!',
      feedback: {
        id: feedback.id,
        stars: feedback.stars,
        npsScore: feedback.npsScore,
        comment: feedback.comment,
        createdAt: feedback.createdAt,
      },
    })
  } catch (error: any) {
    console.error('Error submitting feedback:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback', details: error.message },
      { status: 500 }
    )
  }
}
