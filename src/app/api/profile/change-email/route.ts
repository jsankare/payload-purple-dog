import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * Route pour changer l'email
 * POST /api/profile/change-email
 */
export async function POST(req: NextRequest) {
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

    const body = await req.json()
    const { newEmail, password } = body

    // Validation
    if (!newEmail || !password) {
      return NextResponse.json(
        { error: 'Nouvel email et mot de passe requis' },
        { status: 400 }
      )
    }

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      )
    }

    // Vérifier que le nouvel email n'est pas déjà utilisé
    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: newEmail,
        },
      },
    })

    if (existingUsers.docs.length > 0) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      )
    }

    // Vérifier le mot de passe avant de changer l'email
    try {
      await payload.login({
        collection: 'users',
        data: {
          email: user.email,
          password: password,
        },
      })
    } catch (error) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect' },
        { status: 400 }
      )
    }

    // Mettre à jour l'email et marquer comme non vérifié
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        email: newEmail,
        _verified: false, // L'utilisateur devra re-vérifier son email
      },
    })

    // Envoyer un email de vérification au nouvel email
    // (PayloadCMS le fera automatiquement si la vérification est activée)

    return NextResponse.json({
      success: true,
      message: 'Email changé avec succès. Veuillez vérifier votre nouvel email.',
      newEmail: newEmail,
    })
  } catch (error: any) {
    console.error('Erreur changement email:', error)
    return NextResponse.json(
      { error: 'Erreur lors du changement d\'email', details: error.message },
      { status: 500 }
    )
  }
}
