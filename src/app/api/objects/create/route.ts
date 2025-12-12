import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * POST /api/objects/create
 * 
 * Create a new object from frontend
 * Requires authentication
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    // Get authenticated user from request
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - You must be logged in to create an object' },
        { status: 401 }
      )
    }

    // Detect Content-Type and parse accordingly
    const contentType = request.headers.get('content-type') || ''
    let data: any = {
      seller: user.id, // Assign authenticated user as seller
    }

    if (contentType.includes('application/json')) {
      // Parse JSON body
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
    } else {
      // Parse FormData
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

    // Required fields with defaults
    data.photos = [] // Empty array for now (images upload to be implemented)
    data.documents = [] // Empty array for now
    data.bidCount = 0
    data.viewCount = 0
    data.favoriteCount = 0
    data.auctionExtensions = 0

    // Debug log
    console.log('Creating object with data:', JSON.stringify(data, null, 2))

    // Create the object
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
