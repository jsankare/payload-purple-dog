import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * POST /api/objects/[id]/purchase
 * Purchase an object in quick sale mode
 * Creates a transaction immediately
 * For quick sale objects only
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = await getPayload({ config: configPromise })

    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (user.role !== 'professionnel') {
      return NextResponse.json(
        { error: 'Only professionals can purchase objects' },
        { status: 403 }
      )
    }

    if (!user.hasValidPaymentMethod) {
      return NextResponse.json(
        {
          error: 'You must add a payment method before purchasing',
          code: 'PAYMENT_METHOD_REQUIRED',
        },
        { status: 403 }
      )
    }

    const object = await payload.findByID({
      collection: 'objects',
      id,
      depth: 1,
    })

    if (!object) {
      return NextResponse.json(
        { error: 'Object not found' },
        { status: 404 }
      )
    }

    if (object.saleMode !== 'quick_sale') {
      return NextResponse.json(
        { error: 'This object is not in quick sale mode' },
        { status: 400 }
      )
    }

    if (object.status !== 'active') {
      return NextResponse.json(
        { error: 'This object is not available for purchase' },
        { status: 400 }
      )
    }

    const sellerId = typeof object.seller === 'object' ? object.seller.id : object.seller

    if (user.id === sellerId) {
      return NextResponse.json(
        { error: 'You cannot purchase your own object' },
        { status: 400 }
      )
    }

    const existingTransaction = await payload.find({
      collection: 'transactions',
      where: {
        object: {
          equals: object.id,
        },
      },
      limit: 1,
    })

    if (existingTransaction.docs.length > 0) {
      return NextResponse.json(
        { error: 'This object has already been purchased' },
        { status: 400 }
      )
    }

    const buyerCommissionRate = 0.03
    const sellerCommissionRate = 0.02

    const finalPrice = object.quickSalePrice || 0
    const buyerCommission = finalPrice * buyerCommissionRate
    const sellerCommission = finalPrice * sellerCommissionRate
    const shippingCost = 0
    const totalAmount = finalPrice + buyerCommission + shippingCost
    const sellerAmount = finalPrice - sellerCommission

    const userAddress = user.address
    const addressData = userAddress?.street ? {
      shippingAddress: {
        street: userAddress.street || '',
        city: userAddress.city || '',
        postalCode: userAddress.postalCode || '',
        country: userAddress.country || 'France',
      },
      billingAddress: {
        street: userAddress.street || '',
        city: userAddress.city || '',
        postalCode: userAddress.postalCode || '',
        country: userAddress.country || 'France',
      },
    } : {}

    const transaction = await payload.create({
      collection: 'transactions',
      data: {
        object: object.id,
        buyer: user.id,
        seller: sellerId,
        finalPrice,
        buyerCommission,
        sellerCommission,
        shippingCost,
        totalAmount,
        sellerAmount,
        paymentStatus: 'pending',
        status: 'payment_pending',
        ...addressData,
        notes: `Transaction créée pour achat immédiat`,
      },
      overrideAccess: true,
    })

    await payload.update({
      collection: 'objects',
      id: object.id,
      data: {
        status: 'sold',
      },
      overrideAccess: true,
    })

    try {
      const { purchaseConfirmationTemplate, sellerNotificationTemplate, sendEmail } = await import('@/lib/email/templates')

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'
      const objectUrl = `${appUrl}/objets/${object.id}`
      const checkoutUrl = `${appUrl}/checkout/${transaction.id}`

      const buyerHtml = purchaseConfirmationTemplate({
        objectName: object.name,
        objectUrl,
        totalAmount,
        buyerName: `${user.firstName} ${user.lastName}`,
        checkoutUrl,
      })
      await sendEmail(user.email, 'Achat confirmé - Procédez au paiement', buyerHtml)

      const seller = await payload.findByID({
        collection: 'users',
        id: sellerId,
      })
      const sellerHtml = sellerNotificationTemplate({
        objectName: object.name,
        objectUrl,
        salePrice: finalPrice,
        sellerName: `${seller.firstName} ${seller.lastName}`,
        buyerName: user.firstName,
      })
      await sendEmail(seller.email, 'Votre objet a été vendu !', sellerHtml)
    } catch (emailError) {
      console.error('Error sending purchase emails:', emailError)
    }

    return NextResponse.json({
      transaction,
      message: 'Purchase successful',
    }, { status: 201 })
  } catch (error) {
    console.error('Error purchasing object:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
