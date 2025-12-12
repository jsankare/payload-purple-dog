import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * PUT/PATCH /api/profile/update
 * Update user profile
 */
async function updateProfile(req: NextRequest) {
  try {
    const payload = await getPayload({ config })

    const token = req.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { user } = await payload.auth({ headers: req.headers })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const {
      firstName,
      lastName,
      address,
      companyName,
      siret,
      website,
      socialMedia,
      newsletterSubscription,
      bankInfo,
    } = body

    const updateData: any = {}

    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (address !== undefined) updateData.address = address
    if (newsletterSubscription !== undefined) updateData.newsletterSubscription = newsletterSubscription

    if (bankInfo !== undefined) {
      updateData.bankDetails = {
        iban: bankInfo.iban || '',
        bic: bankInfo.bic || '',
        accountHolderName: bankInfo.accountHolder || '',
      }
    }

    if (user.role === 'professionnel') {
      if (companyName !== undefined) updateData.companyName = companyName
      if (siret !== undefined) updateData.siret = siret
      if (website !== undefined) updateData.website = website
      if (socialMedia !== undefined) updateData.socialMedia = socialMedia
    }

    const updatedUser = await payload.update({
      collection: 'users',
      id: user.id,
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        address: updatedUser.address,
        newsletterSubscription: updatedUser.newsletterSubscription,
      },
    })
  } catch (error: any) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile', details: error.message },
      { status: 500 }
    )
  }
}

// Export both PUT and PATCH methods
export async function PUT(req: NextRequest) {
  return updateProfile(req)
}

export async function PATCH(req: NextRequest) {
  return updateProfile(req)
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:4000',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  })
}
