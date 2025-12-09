import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * Endpoint de test pour créer rapidement un utilisateur professionnel
 * À utiliser uniquement en développement
 */
export async function POST() {
  try {
    const payload = await getPayload({ config })

    // Créer un utilisateur professionnel simple
    const user = await payload.create({
      collection: 'users',
      data: {
        email: `test-${Date.now()}@example.com`,
        password: 'Test123456!',
        role: 'professionnel',
        firstName: 'Jean',
        lastName: 'Test',
        companyName: 'Test SARL',
        siret: '12345678901234',
        officialDocument: 1, // ID fictif
        address: {
          street: '123 rue Test',
          city: 'Paris',
          postalCode: '75001',
          country: 'France',
        },
        acceptedTerms: true,
        acceptedMandate: true,
        acceptedGDPR: true,
      },
    })

    return NextResponse.json({
      success: true,
      userId: user.id,
      email: user.email,
      message: 'Utilisateur créé avec succès',
    })
  } catch (error: any) {
    console.error('Erreur création utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur création utilisateur', details: error.message },
      { status: 500 }
    )
  }
}
