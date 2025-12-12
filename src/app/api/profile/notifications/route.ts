import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'


async function updateNotifications(req: NextRequest) {
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
    const { newsletterSubscription } = body

    if (newsletterSubscription === undefined) {
      return NextResponse.json(
        { error: 'Newsletter preference required' },
        { status: 400 }
      )
    }

    const updatedUser = await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        newsletterSubscription: newsletterSubscription,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated',
      notifications: {
        newsletterSubscription: updatedUser.newsletterSubscription,
      },
    })
  } catch (error: any) {
    console.error('Error updating notifications:', error)
    return NextResponse.json(
      { error: 'Failed to update preferences', details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  return updateNotifications(req)
}

export async function PATCH(req: NextRequest) {
  return updateNotifications(req)
}

/**
 * GET /api/profile/notifications
 * Get notification preferences
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

    return NextResponse.json({
      success: true,
      notifications: {
        newsletterSubscription: user.newsletterSubscription || false,
      },
    })
  } catch (error: any) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences', details: error.message },
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
