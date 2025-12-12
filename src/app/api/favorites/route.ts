import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * GET /api/favorites
 * 
 * Get all favorites for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    // Get authenticated user from request headers
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch user's favorites
    const result = await payload.find({
      collection: 'favorites',
      where: {
        user: {
          equals: user.id,
        },
      },
      depth: 1, // Include object details
      sort: '-createdAt',
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/favorites
 * 
 * Toggle favorite (add or remove)
 * Updates favoriteCount on the object
 * 
 * Body:
 * - objectId: string
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    // Get authenticated user from request headers
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { objectId } = body

    if (!objectId) {
      return NextResponse.json(
        { error: 'objectId is required' },
        { status: 400 }
      )
    }

    // Check if favorite already exists
    const existing = await payload.find({
      collection: 'favorites',
      where: {
        and: [
          { user: { equals: user.id } },
          { object: { equals: objectId } },
        ],
      },
      limit: 1,
    })

    const favorite = existing.docs[0]
    let createdFavorite = null

    // Toggle favorite
    if (favorite) {
      // Remove favorite
      await payload.delete({
        collection: 'favorites',
        id: favorite.id,
      })
    } else {
      // Add favorite
      createdFavorite = await payload.create({
        collection: 'favorites',
        data: {
          user: user.id,
          object: objectId,
        },
      })
    }

    // Update favoriteCount on object
    try {
      const object = await payload.findByID({
        collection: 'objects',
        id: objectId,
      })

      const currentCount = typeof object.favoriteCount === 'number'
        ? object.favoriteCount
        : 0

      const newCount = favorite
        ? Math.max(0, currentCount - 1) // Decrement (remove)
        : currentCount + 1 // Increment (add)

      await payload.update({
        collection: 'objects',
        id: objectId,
        data: {
          favoriteCount: newCount,
        },
      })
    } catch (objectError) {
      // Log error but don't fail the request
      console.error('Error updating object favoriteCount:', objectError)
    }

    return NextResponse.json(
      {
        isFavorite: !favorite, // true if added, false if removed
        favorite: createdFavorite || null,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
