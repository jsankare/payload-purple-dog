import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * POST /api/users/login-check
 * Login with account status verification
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
      limit: 1,
    })

    if (users.docs.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const user = users.docs[0]

    if (user.accountStatus === 'suspended') {
      return NextResponse.json(
        {
          error: 'Your account has been suspended. Please contact an administrator.',
          accountStatus: 'suspended'
        },
        { status: 403 }
      )
    }

    if (user.accountStatus === 'rejected') {
      return NextResponse.json(
        {
          error: 'Your account has been rejected.',
          accountStatus: 'rejected'
        },
        { status: 403 }
      )
    }

    const loginResult = await payload.login({
      collection: 'users',
      data: {
        email,
        password,
      },
    })

    return NextResponse.json({
      message: 'Login successful',
      token: loginResult.token,
      user: {
        id: loginResult.user.id,
        email: loginResult.user.email,
        role: loginResult.user.role,
        firstName: loginResult.user.firstName,
        lastName: loginResult.user.lastName,
        accountStatus: loginResult.user.accountStatus,
      },
      exp: loginResult.exp,
    })
  } catch (error: any) {
    console.error('Login error:', error)

    if (error.message?.includes('Invalid login')) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Login failed', details: error.message },
      { status: 500 }
    )
  }
}
