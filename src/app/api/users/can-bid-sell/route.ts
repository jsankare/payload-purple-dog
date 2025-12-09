import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * Route pour vérifier si un utilisateur peut enchérir ou vendre
 * GET /api/users/can-bid-sell
 * 
 * Règles métier :
 * - Professionnel : Peut ACHETER ET VENDRE si coordonnées bancaires renseignées
 * - Particulier : Peut SEULEMENT VENDRE (pas acheter) si coordonnées bancaires renseignées
 */
export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    // Vérifier l'authentification
    const { user } = await payload.auth({ headers: req.headers })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer les informations complètes de l'utilisateur
    const fullUser = await payload.findByID({
      collection: 'users',
      id: user.id,
    })

    if (!fullUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier si les coordonnées bancaires sont renseignées
    const hasBankDetails = !!(
      fullUser.bankDetails?.iban &&
      fullUser.bankDetails?.bic &&
      fullUser.bankDetails?.accountHolderName
    )

    const bankDetailsVerified = fullUser.bankDetails?.bankDetailsVerified || false

    // Déterminer les permissions selon le rôle
    let canBid = false
    let canSell = false
    let reasons = []

    if (fullUser.role === 'professionnel') {
      // Les professionnels peuvent enchérir ET vendre s'ils ont des coordonnées bancaires
      if (hasBankDetails) {
        canBid = true
        canSell = true
      } else {
        reasons.push('Vous devez renseigner vos coordonnées bancaires pour enchérir et vendre')
      }
      
    } else if (fullUser.role === 'particulier') {
      // Les particuliers ne peuvent PAS enchérir/acheter
      canBid = false
      reasons.push('Les particuliers ne peuvent pas acheter sur la plateforme')
      
      // Les particuliers peuvent vendre s'ils ont des coordonnées bancaires
      if (hasBankDetails) {
        canSell = true
      } else {
        reasons.push('Vous devez renseigner vos coordonnées bancaires pour vendre')
      }
      
    } else if (fullUser.role === 'admin') {
      // Les admins peuvent tout faire
      canBid = true
      canSell = true
    }

    // Vérifier le statut du compte
    if (fullUser.accountStatus === 'suspended') {
      canBid = false
      canSell = false
      reasons.push('Votre compte est suspendu')
    }

    if (fullUser.accountStatus === 'rejected') {
      canBid = false
      canSell = false
      reasons.push('Votre compte a été rejeté')
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
        ? 'Autorisations vérifiées' 
        : 'Vous devez compléter votre profil pour accéder à cette fonctionnalité',
    })
  } catch (error: any) {
    console.error('Erreur vérification permissions:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification des permissions', details: error.message },
      { status: 500 }
    )
  }
}
