import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * PUT /api/feedback/[id]
 * Update feedback (owner or admin only)
 * 
 * DELETE /api/feedback/[id]
 * Delete feedback (owner or admin only)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = await getPayload({ config })

    const { user } = await payload.auth({ headers: req.headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const feedbackId = parseInt(id)

    if (isNaN(feedbackId)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { stars, npsScore, comment } = body

    if (stars !== undefined && (stars < 1 || stars > 5)) {
      return NextResponse.json(
        { error: 'Star rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    if (npsScore !== undefined && (npsScore < 1 || npsScore > 10)) {
      return NextResponse.json(
        { error: 'NPS score must be between 1 and 10' },
        { status: 400 }
      )
    }

    const feedback = await payload.findByID({
      collection: 'feedback',
      id: feedbackId,
    })

    if (!feedback) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      )
    }

    const isOwner = typeof feedback.user === 'object'
      ? feedback.user.id === user.id
      : feedback.user === user.id
    const isAdmin = user.role === 'admin'

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this feedback' },
        { status: 403 }
      )
    }

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
      message: 'Feedback updated successfully',
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
    console.error('Error updating feedback:', error)
    return NextResponse.json(
      { error: 'Failed to update feedback', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = await getPayload({ config })

    const { user } = await payload.auth({ headers: req.headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const feedbackId = parseInt(id)

    if (isNaN(feedbackId)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      )
    }

    const feedback = await payload.findByID({
      collection: 'feedback',
      id: feedbackId,
    })

    if (!feedback) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      )
    }

    const isOwner = typeof feedback.user === 'object'
      ? feedback.user.id === user.id
      : feedback.user === user.id
    const isAdmin = user.role === 'admin'

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this feedback' },
        { status: 403 }
      )
    }

    await payload.delete({
      collection: 'feedback',
      id: feedbackId,
    })

    return NextResponse.json({
      success: true,
      message: 'Feedback deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting feedback:', error)
    return NextResponse.json(
      { error: 'Failed to delete feedback', details: error.message },
      { status: 500 }
    )
  }
}
