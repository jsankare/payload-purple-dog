import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * POST /api/offers/[id]/reject
 * 
 * Reject an offer (seller only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { id } = await params

    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const offer = await payload.findByID({
      collection: 'offers',
      id,
      depth: 2,
    })

    if (!offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      )
    }

    const object = typeof offer.object === 'object' ? offer.object : await payload.findByID({
      collection: 'objects',
      id: offer.object,
    })

    const sellerId = typeof object.seller === 'object' ? object.seller?.id : object.seller

    if (user.role !== 'admin' && user.id !== sellerId) {
      return NextResponse.json(
        { error: 'Only the seller can reject offers' },
        { status: 403 }
      )
    }

    if (offer.status !== 'pending') {
      return NextResponse.json(
        { error: 'This offer has already been processed' },
        { status: 400 }
      )
    }

    const updatedOffer = await payload.update({
      collection: 'offers',
      id: offer.id,
      data: {
        status: 'rejected',
      },
      overrideAccess: true,
    })

    /** Send email notification to buyer */
    try {
      const buyerId = typeof offer.buyer === 'object' ? offer.buyer?.id : offer.buyer

      const buyer = await payload.findByID({
        collection: 'users',
        id: buyerId,
      })

      const { sendEmail } = await import('@/lib/email/templates')
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; padding: 30px; }
    .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; margin: -30px -30px 20px -30px; }
    .button { display: inline-block; padding: 12px 30px; background: #7c3aed; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Offre refusée</h1>
    </div>
    <p>Bonjour ${buyer.firstName},</p>
    <p>Malheureusement, votre offre de <strong>${offer.amount}€</strong> pour <strong>${object.name}</strong> a été refusée par le vendeur.</p>
    <p>N'hésitez pas à consulter d'autres objets disponibles sur la plateforme.</p>
    <div style="text-align: center;">
      <a href="${appUrl}/objets" class="button">Voir les objets disponibles</a>
    </div>
  </div>
</body>
</html>
      `.trim()

      await sendEmail(buyer.email, 'Votre offre a été refusée', html)
    } catch (emailError) {
      console.error('Error sending offer rejection email:', emailError)
    }

    return NextResponse.json({
      message: 'Offer rejected successfully',
      offer: updatedOffer,
    }, { status: 200 })
  } catch (error) {
    console.error('Error rejecting offer:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
