import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * Route pour récupérer le profil complet de l'utilisateur connecté
 * GET /api/profile
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

    // Récupérer le profil complet
    const fullUser = await payload.findByID({
      collection: 'users',
      id: user.id,
    })

    // Préparer la réponse selon le rôle
    const profileData: any = {
      id: fullUser.id,
      email: fullUser.email,
      firstName: fullUser.firstName,
      lastName: fullUser.lastName,
      role: fullUser.role,
      address: fullUser.address,
      newsletterSubscription: fullUser.newsletterSubscription,
      bankDetails: fullUser.bankDetails,
      _verified: fullUser._verified,
      accountStatus: fullUser.accountStatus,
      createdAt: fullUser.createdAt,
      updatedAt: fullUser.updatedAt,
    }

    // Ajouter les champs spécifiques selon le rôle
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
      // Note: stripeCustomerId et subscriptionStatus sont des champs internes
      // non modifiables par l'utilisateur, donc non retournés
    }

    if (fullUser.role === 'admin') {
      // Les admins voient tout
      return NextResponse.json({
        success: true,
        profile: fullUser,
      })
    }

    // Champs communs RGPD
    profileData.acceptedGDPR = fullUser.acceptedGDPR

    return NextResponse.json({
      success: true,
      profile: profileData,
    })
  } catch (error: any) {
    console.error('Erreur récupération profil:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du profil', details: error.message },
      { status: 500 }
    )
  }
}
