import { NextRequest, NextResponse } from 'next/server'
import { getCachedPayload } from '@/lib/payload-singleton'

/**
 * POST /api/verify-email/[token]
 * Optimized email verification endpoint (bypasses Payload CMS 3.x performance issues)
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const startTime = Date.now()

  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json(
        { error: 'Token missing' },
        { status: 400 }
      )
    }

    const payload = await getCachedPayload()

    const users = await payload.find({
      collection: 'users',
      where: {
        _verificationToken: {
          equals: token,
        },
      },
      limit: 1,
      depth: 0,
    })

    if (users.docs.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      )
    }

    const user = users.docs[0]

    if (user._verified) {
      return NextResponse.json({
        message: 'Account already verified',
        success: true,
      })
    }

    /** Direct DB update to avoid hooks and improve performance */
    const db = payload.db

    await db.updateOne({
      collection: 'users',
      where: { id: { equals: user.id } },
      data: {
        _verified: true,
        _verificationToken: null,
      },
    })

    const totalTime = Date.now() - startTime
    console.log(`[PERF] Fast verification (direct DB) took ${totalTime}ms`)

    return NextResponse.json({
      message: 'Account verified successfully',
      success: true,
    })
  } catch (error: any) {
    const totalTime = Date.now() - startTime
    console.error(`Verification error (${totalTime}ms):`, error)
    return NextResponse.json(
      { error: error.message || 'Verification failed' },
      { status: 400 }
    )
  }
}
