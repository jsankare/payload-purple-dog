import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * POST /api/profile/change-email
 * Change user email address
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
    const { newEmail, password } = body

    if (!newEmail || !password) {
      return NextResponse.json(
        { error: 'New email and password required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: newEmail,
        },
      },
    })

    if (existingUsers.docs.length > 0) {
      return NextResponse.json(
        { error: 'This email is already in use' },
        { status: 400 }
      )
    }

    try {
      await payload.login({
        collection: 'users',
        data: {
          email: user.email,
          password: password,
        },
      })
    } catch (error) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 400 }
      )
    }

    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        email: newEmail,
        _verified: false,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Email changed successfully. Please verify your new email.',
      newEmail: newEmail,
    })
  } catch (error: any) {
    console.error('Error changing email:', error)
    return NextResponse.json(
      { error: 'Failed to change email', details: error.message },
      { status: 500 }
    )
  }
}
