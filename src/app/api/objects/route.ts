import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * GET /api/objects
 * 
 * List objects with filters
 * 
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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 12
    const category = searchParams.get('category')
    const saleMode = searchParams.get('saleMode')
    const status = searchParams.get('status') || 'active'
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    // Build where clause
    const where: any = {}

    // Filter by status (default to 'active')
    if (status) {
      where.status = { equals: status }
    }

    // Filter by category
    if (category) {
      where.category = { equals: category }
    }

    // Filter by sale mode
    if (saleMode) {
      where.saleMode = { equals: saleMode }
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      if (saleMode === 'quick_sale') {
        // Filter on quickSalePrice for quick sales
        where.quickSalePrice = {}
        if (minPrice) {
          where.quickSalePrice.greater_than_equal = Number(minPrice)
        }
        if (maxPrice) {
          where.quickSalePrice.less_than_equal = Number(maxPrice)
        }
      } else if (saleMode === 'auction') {
        // Filter on auctionStartPrice for auctions
        where.auctionStartPrice = {}
        if (minPrice) {
          where.auctionStartPrice.greater_than_equal = Number(minPrice)
        }
        if (maxPrice) {
          where.auctionStartPrice.less_than_equal = Number(maxPrice)
        }
      } else {
        // If saleMode not specified, filter on quickSalePrice by default
        where.quickSalePrice = {}
        if (minPrice) {
          where.quickSalePrice.greater_than_equal = Number(minPrice)
        }
        if (maxPrice) {
          where.quickSalePrice.less_than_equal = Number(maxPrice)
        }
      }
    }

    // Fetch objects
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
