import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * GET /api/objects
 * List objects with filters
 * Query params:
 * - page: number (default 1)
 * - limit: number (default 12)
 * - category: category ID (optional)
 * - saleMode: 'quick_sale' | 'auction' (optional)
 * - status: object status (optional, default 'active')
 * - minPrice: number (optional)
 * - maxPrice: number (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 12
    const category = searchParams.get('category')
    const saleMode = searchParams.get('saleMode')
    const status = searchParams.get('status') || 'active'
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    const where: any = {}

    if (status) {
      where.status = { equals: status }
    }

    if (category) {
      where.category = { equals: category }
    }

    if (saleMode) {
      where.saleMode = { equals: saleMode }
    }

    if (minPrice || maxPrice) {
      if (saleMode === 'quick_sale') {
        where.quickSalePrice = {}
        if (minPrice) {
          where.quickSalePrice.greater_than_equal = Number(minPrice)
        }
        if (maxPrice) {
          where.quickSalePrice.less_than_equal = Number(maxPrice)
        }
      } else if (saleMode === 'auction') {
        where.auctionStartPrice = {}
        if (minPrice) {
          where.auctionStartPrice.greater_than_equal = Number(minPrice)
        }
        if (maxPrice) {
          where.auctionStartPrice.less_than_equal = Number(maxPrice)
        }
      } else {
        where.quickSalePrice = {}
        if (minPrice) {
          where.quickSalePrice.greater_than_equal = Number(minPrice)
        }
        if (maxPrice) {
          where.quickSalePrice.less_than_equal = Number(maxPrice)
        }
      }
    }

    const result = await payload.find({
      collection: 'objects',
      page,
      limit,
      where,
      sort: '-publishedAt',
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Error fetching objects:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/objects
 * Create a new object (redirects to /create for full implementation)
 * Requires authentication
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - You must be logged in to create an object' },
        { status: 401 }
      )
    }

    const contentType = request.headers.get('content-type') || ''
    let data: any = {
      seller: user.id,
    }

    if (contentType.includes('application/json')) {
      const body = await request.json()

      data.name = body.name
      data.description = body.description
      data.category = typeof body.category === 'number' ? body.category : parseInt(body.category)
      data.saleMode = body.saleMode
      data.status = body.status || 'active'

      if (body.quickSalePrice !== undefined) {
        data.quickSalePrice = typeof body.quickSalePrice === 'number' ? body.quickSalePrice : parseFloat(body.quickSalePrice)
      }

      if (body.auctionStartPrice !== undefined) {
        data.auctionStartPrice = typeof body.auctionStartPrice === 'number' ? body.auctionStartPrice : parseFloat(body.auctionStartPrice)
      }

      if (body.auctionEndDate) {
        data.auctionEndDate = body.auctionEndDate
      }

      if (body.dimensions) {
        data.dimensions = body.dimensions
      }

      if (body.photos && Array.isArray(body.photos)) {
        data.photos = body.photos
      }
    } else {
      const formData = await request.formData()

      data.name = formData.get('name')
      data.description = formData.get('description')
      data.category = parseInt(formData.get('category') as string)
      data.saleMode = formData.get('saleMode')
      data.status = formData.get('status') || 'active'

      const quickSalePrice = formData.get('quickSalePrice')
      if (quickSalePrice) {
        data.quickSalePrice = parseFloat(quickSalePrice as string)
      }

      const auctionStartPrice = formData.get('auctionStartPrice')
      if (auctionStartPrice) {
        data.auctionStartPrice = parseFloat(auctionStartPrice as string)
      }

      const auctionEndDate = formData.get('auctionEndDate')
      if (auctionEndDate) {
        data.auctionEndDate = auctionEndDate
      }

      const dimensions = formData.get('dimensions')
      if (dimensions) {
        try {
          data.dimensions = JSON.parse(dimensions as string)
        } catch (e) {
          console.error('Error parsing dimensions:', e)
        }
      }
    }

    if (!data.photos) data.photos = []
    data.documents = []
    data.bidCount = 0
    data.viewCount = 0
    data.favoriteCount = 0
    data.auctionExtensions = 0

    const result = await payload.create({
      collection: 'objects',
      data,
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating object:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
