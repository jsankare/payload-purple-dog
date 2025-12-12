/**
 * POST /api/test-create-user
 * Test endpoint to quickly create professional user (dev only)
 */

import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST() {
  try {
    const payload = await getPayload({ config })

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
        officialDocument: 1,
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
      message: 'User created successfully',
    })
  } catch (error: any) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user', details: error.message },
      { status: 500 }
    )
  }
}
