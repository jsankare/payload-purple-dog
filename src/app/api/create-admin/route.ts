import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadHMR({ config })

    // Vérifier si un admin existe déjà
    const existingAdmins = await payload.find({
      collection: 'users',
      where: {
        role: {
          equals: 'admin',
        },
      },
      limit: 1,
    })

    if (existingAdmins.docs.length > 0) {
      return NextResponse.json(
        {
          error: 'Un administrateur existe déjà',
          admin: {
            id: existingAdmins.docs[0].id,
            email: existingAdmins.docs[0].email,
          },
        },
        { status: 400 }
      )
    }

    // Créer l'admin
    const admin = await payload.create({
      collection: 'users',
      data: {
        email: 'admin@purpledog.com',
        password: 'Admin123!',
        role: 'admin',
        firstName: 'Admin',
        lastName: 'Purple Dog',
        address: {
          street: '1 rue Admin',
          city: 'Paris',
          postalCode: '75001',
          country: 'France',
        },
        acceptedGDPR: true,
        _verified: true, // Email vérifié
        emailVerified: true,
        accountStatus: 'active', // Compte actif
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Administrateur créé avec succès',
      credentials: {
        email: 'admin@purpledog.com',
        password: 'Admin123!',
        loginUrl: `${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'}/admin`,
      },
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    })
  } catch (error: any) {
    console.error('Erreur création admin:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la création de l\'administrateur',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
