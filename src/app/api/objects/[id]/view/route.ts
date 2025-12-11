import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await getPayload({ config })
    const { id } = params

    const object = await payload.findByID({
      collection: 'objects',
      id,
    })

    if (!object) {
      return NextResponse.json(
        { error: 'Objet non trouvé' },
        { status: 404 }
      )
    }

    const currentViews = object.views || 0
    await payload.update({
      collection: 'objects',
      id,
      data: {
        views: currentViews + 1,
      },
    })

    return NextResponse.json({ 
      success: true, 
      views: currentViews + 1 
    })
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation des vues:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'incrémentation des vues' },
      { status: 500 }
    )
  }
}
