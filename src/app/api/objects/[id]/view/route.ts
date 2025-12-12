import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * POST /api/objects/[id]/view
 * Increment view count for an object
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config })
    const { id } = await params

    const object = await payload.findByID({
      collection: 'objects',
      id,
    })

    if (!object) {
      return NextResponse.json(
        { error: 'Object not found' },
        { status: 404 }
      )
    }

    const currentViews = object.viewCount || 0
    await payload.update({
      collection: 'objects',
      id,
      data: {
        viewCount: currentViews + 1,
      },
    })

    return NextResponse.json({
      success: true,
      views: currentViews + 1
    })
  } catch (error) {
    console.error('Error incrementing views:', error)
    return NextResponse.json(
      { error: 'Failed to increment views' },
      { status: 500 }
    )
  }
}
