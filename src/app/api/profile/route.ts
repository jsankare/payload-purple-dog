import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * GET /api/profile
 * Returns full profile of authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config })

    const { user } = await payload.auth({ headers: req.headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const fullUser = await payload.findByID({
      collection: 'users',
      id: user.id,
    })

    const profileData: any = {
      id: fullUser.id,
      email: fullUser.email,
      firstName: fullUser.firstName,
      lastName: fullUser.lastName,
      role: fullUser.role,
      address: fullUser.address,
      bankDetails: fullUser.bankDetails,
      newsletterSubscription: fullUser.newsletterSubscription,
      _verified: fullUser._verified,
      accountStatus: fullUser.accountStatus,
      createdAt: fullUser.createdAt,
      updatedAt: fullUser.updatedAt,
    }

    if (fullUser.role === 'particulier') {
      profileData.isOver18 = fullUser.isOver18
    }

    if (fullUser.role === 'professionnel') {
      profileData.companyName = fullUser.companyName
      profileData.siret = fullUser.siret
      profileData.officialDocument = fullUser.officialDocument
      profileData.website = fullUser.website
      profileData.socialMedia = fullUser.socialMedia
      profileData.acceptedTerms = fullUser.acceptedTerms
      profileData.acceptedMandate = fullUser.acceptedMandate
    }

    if (fullUser.role === 'admin') {
      return NextResponse.json({
        success: true,
        profile: fullUser,
      })
    }

    profileData.acceptedGDPR = fullUser.acceptedGDPR

    return NextResponse.json({
      success: true,
      profile: profileData,
    })
  } catch (error: any) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile', details: error.message },
      { status: 500 }
    )
  }
}
