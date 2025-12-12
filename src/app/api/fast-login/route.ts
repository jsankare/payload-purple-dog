import { NextRequest, NextResponse } from 'next/server'
import { getCachedPayload } from '@/lib/payload-singleton'
import { cookies } from 'next/headers'

/**
 * POST /api/fast-login
 * Optimized login endpoint - bypasses Payload CMS 3.x performance issues
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now()

  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    const payload = await getCachedPayload()

    const result = await payload.login({
      collection: 'users',
      data: {
        email,
        password,
      },
    })

    if (!result.user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    if (!result.user._verified) {
      return NextResponse.json(
        { error: 'Please verify your email before logging in' },
        { status: 403 }
      )
    }

    const totalTime = Date.now() - startTime
    console.log(`[PERF] Fast login took ${totalTime}ms`)

    const response = NextResponse.json({
      user: result.user,
      token: result.token,
      exp: result.exp,
      message: 'Login successful',
    })

    if (result.token) {
      response.cookies.set('payload-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24,
      })
    }

    return response
  } catch (error: any) {
    const totalTime = Date.now() - startTime
    console.error(`Login error (${totalTime}ms):`, error)

    if (error.message?.includes('credentials') || error.message?.includes('Invalid')) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 400 }
    )
  }
}
