import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * GET /api/objects/[id]
 * 
 * Get object details and increment view count
 * 
 * @param params.id - Object ID
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config: configPromise })
    const params = await props.params
    const { id } = params

    // Try to fetch object (findByID throws if not found)
    let object
    try {
      object = await payload.findByID({
        collection: 'objects',
        id,
      })
    } catch (error) {
      // Object not found
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      )
    }

    // Increment view count
    const currentViews = typeof object.viewCount === 'number' ? object.viewCount : 0
    const updated = await payload.update({
      collection: 'objects',
      id,
      data: {
        viewCount: currentViews + 1,
      },
      depth: 2,
      overrideAccess: true, // Skip validation for existing objects
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error('Error fetching object:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
