import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * GET /api/users/can-bid-sell
 * Check if user can bid or sell
 * Business rules:
 * - Professional: Can BUY AND SELL if bank details provided
 * - Individual: Can ONLY SELL (not buy) if bank details provided
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

    if (!fullUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const hasBankDetails = !!(
      fullUser.bankDetails?.iban &&
      fullUser.bankDetails?.bic &&
      fullUser.bankDetails?.accountHolderName
    )

    const bankDetailsVerified = fullUser.bankDetails?.bankDetailsVerified || false

    let canBid = false
    let canSell = false
    let reasons = []

    if (fullUser.role === 'professionnel') {
      if (hasBankDetails) {
        canBid = true
        canSell = true
      } else {
        reasons.push('You must provide bank details to bid and sell')
      }

    } else if (fullUser.role === 'particulier') {
      canBid = false
      reasons.push('Individuals cannot buy on the platform')

      if (hasBankDetails) {
        canSell = true
      } else {
        reasons.push('You must provide bank details to sell')
      }

    } else if (fullUser.role === 'admin') {
      canBid = true
      canSell = true
    }

    if (fullUser.accountStatus === 'suspended') {
      canBid = false
      canSell = false
      reasons.push('Your account is suspended')
    }

    if (fullUser.accountStatus === 'rejected') {
      canBid = false
      canSell = false
      reasons.push('Your account has been rejected')
    }

    return NextResponse.json({
      success: true,
      user: {
        id: fullUser.id,
        email: fullUser.email,
        role: fullUser.role,
        accountStatus: fullUser.accountStatus,
      },
      permissions: {
        canBid,
        canSell,
        hasBankDetails,
        bankDetailsVerified,
      },
      reasons: reasons.length > 0 ? reasons : undefined,
      message: canBid || canSell
        ? 'Permissions verified'
        : 'You must complete your profile to access this feature',
    })
  } catch (error: any) {
    console.error('Error checking permissions:', error)
    return NextResponse.json(
      { error: 'Failed to check permissions', details: error.message },
      { status: 500 }
    )
  }
}
