import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    const { user } = await payload.auth({ headers: req.headers })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    if (user.role !== 'professionnel' && user.role !== 'particulier' && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Vous devez être un utilisateur vérifié pour vendre des objets' },
        { status: 403 }
      )
    }

    const formData = await req.formData()
    
    const name = formData.get('name') as string
    const category = formData.get('category') as string
    const description = formData.get('description') as string
    const length = parseFloat(formData.get('length') as string)
    const width = parseFloat(formData.get('width') as string)
    const height = parseFloat(formData.get('height') as string)
    const weight = parseFloat(formData.get('weight') as string)
    const price = parseFloat(formData.get('price') as string)
    const saleMode = formData.get('saleMode') as string
    const startingPrice = formData.get('startingPrice') ? parseFloat(formData.get('startingPrice') as string) : undefined
    const reservePrice = formData.get('reservePrice') ? parseFloat(formData.get('reservePrice') as string) : undefined

    if (!name || !category || !description || !length || !width || !height || !weight || !price || !saleMode) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      )
    }

    const documents: any[] = []
    let docIndex = 0
    while (formData.has(`document_${docIndex}`)) {
      const file = formData.get(`document_${docIndex}`) as File
      if (file && file.size > 0) {
        try {
          const uploadedDoc = await payload.create({
            collection: 'media',
            data: {
              alt: `Document ${docIndex + 1} - ${name}`,
            },
            file: {
              data: Buffer.from(await file.arrayBuffer()),
              mimetype: file.type,
              name: file.name,
              size: file.size,
            },
          })
          documents.push({ document: uploadedDoc.id })
        } catch (error) {
          console.error(`Erreur upload document ${docIndex}:`, error)
        }
      }
      docIndex++
    }

    const photos: any[] = []
    let photoIndex = 0
    while (formData.has(`photo_${photoIndex}`)) {
      const file = formData.get(`photo_${photoIndex}`) as File
      if (file && file.size > 0) {
        try {
          const uploadedPhoto = await payload.create({
            collection: 'media',
            data: {
              alt: `Photo ${photoIndex + 1} - ${name}`,
            },
            file: {
              data: Buffer.from(await file.arrayBuffer()),
              mimetype: file.type,
              name: file.name,
              size: file.size,
            },
          })
          photos.push({ photo: uploadedPhoto.id })
        } catch (error) {
          console.error(`Erreur upload photo ${photoIndex}:`, error)
        }
      }
      photoIndex++
    }

    if (photos.length < 10) {
      return NextResponse.json(
        { error: 'Minimum 10 photos requises' },
        { status: 400 }
      )
    }

    const objectData: any = {
      name,
      category,
      description,
      dimensions: {
        length,
        width,
        height,
        weight,
      },
      documents,
      photos,
      price,
      saleMode,
      seller: user.id,
      status: 'active',
    }

    if (saleMode === 'auction') {
      objectData.auctionConfig = {
        startingPrice: startingPrice || price * 0.9,
        reservePrice: reservePrice || price,
        duration: 7,
      }
    }

    const createdObject = await payload.create({
      collection: 'objects',
      data: objectData,
    })

    return NextResponse.json({
      success: true,
      message: 'Objet publié avec succès et maintenant visible sur la plateforme',
      object: {
        id: createdObject.id,
        name: createdObject.name,
        status: createdObject.status,
      },
    })
  } catch (error: any) {
    console.error('Erreur création objet:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'objet', details: error.message },
      { status: 500 }
    )
  }
}
