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

    data.photos = []
    data.documents = []
    data.bidCount = 0
    data.viewCount = 0
    data.favoriteCount = 0
    data.auctionExtensions = 0

    console.log('Creating object with data:', JSON.stringify(data, null, 2))

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
