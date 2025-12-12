import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * GET /api/favorites
 * Returns all favorites for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const result = await payload.find({
      collection: 'favorites',
      where: {
        user: {
          equals: user.id,
        },
      },
      depth: 1,
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
 * Toggle favorite (add/remove) and update object favoriteCount
 * @param objectId - Object ID to favorite/unfavorite
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { objectId } = body

    if (!objectId) {
      return NextResponse.json(
        { error: 'objectId is required' },
        { status: 400 }
      )
    }

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

    const objectIdNum = typeof objectId === 'string' ? parseInt(objectId, 10) : objectId
    const userIdNum = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id

    if (favorite) {
      await payload.delete({
        collection: 'favorites',
        id: favorite.id,
      })
    } else {
      createdFavorite = await payload.create({
        collection: 'favorites',
        data: {
          user: userIdNum,
          object: objectIdNum,
        },
      })
    }

    /** Update favoriteCount on object */
    try {
      const object = await payload.findByID({
        collection: 'objects',
        id: objectId,
      })

      const currentCount = typeof object.favoriteCount === 'number'
        ? object.favoriteCount
        : 0

      const newCount = favorite
        ? Math.max(0, currentCount - 1)
        : currentCount + 1

      await payload.update({
        collection: 'objects',
        id: objectId,
        data: {
          favoriteCount: newCount,
        },
      })
    } catch (objectError) {
      console.error('Error updating object favoriteCount:', objectError)
    }

    return NextResponse.json(
      {
        isFavorite: !favorite,
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
