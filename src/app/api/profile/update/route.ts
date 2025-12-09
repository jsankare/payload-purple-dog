import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * Route pour mettre à jour le profil utilisateur
 * PUT /api/profile/update
 */
export async function PUT(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    // Récupérer l'utilisateur authentifié depuis les headers
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier l'utilisateur avec le token
    const { user } = await payload.auth({ headers: req.headers })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
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
    } = body

    // Préparer les données à mettre à jour selon le rôle
    const updateData: any = {}

    // Champs communs
    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (address !== undefined) updateData.address = address
    if (newsletterSubscription !== undefined) updateData.newsletterSubscription = newsletterSubscription

    // Champs pour professionnels
    if (user.role === 'professionnel') {
      if (companyName !== undefined) updateData.companyName = companyName
      if (siret !== undefined) updateData.siret = siret
      if (website !== undefined) updateData.website = website
      if (socialMedia !== undefined) updateData.socialMedia = socialMedia
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await payload.update({
      collection: 'users',
      id: user.id,
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: 'Profil mis à jour avec succès',
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
    console.error('Erreur mise à jour profil:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil', details: error.message },
      { status: 500 }
    )
  }
}
