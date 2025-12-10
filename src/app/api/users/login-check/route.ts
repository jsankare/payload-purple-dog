import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * Route de login avec vérification du statut du compte
 * POST /api/users/login-check
 * Cette route vérifie d'abord le statut du compte avant de permettre la connexion
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    // Récupérer l'utilisateur par email
    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
      limit: 1,
    })

    if (users.docs.length === 0) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    const user = users.docs[0]

    // Vérifier le statut du compte AVANT d'essayer de se connecter
    if (user.accountStatus === 'suspended') {
      return NextResponse.json(
        { 
          error: 'Votre compte a été suspendu. Veuillez contacter un administrateur.',
          accountStatus: 'suspended'
        },
        { status: 403 }
      )
    }

    if (user.accountStatus === 'rejected') {
      return NextResponse.json(
        { 
          error: 'Votre compte a été rejeté.',
          accountStatus: 'rejected'
        },
        { status: 403 }
      )
    }

    // Si le compte est OK, effectuer le login normal via Payload
    const loginResult = await payload.login({
      collection: 'users',
      data: {
        email,
        password,
      },
    })

    return NextResponse.json({
      message: 'Connexion réussie',
      token: loginResult.token,
      user: {
        id: loginResult.user.id,
        email: loginResult.user.email,
        role: loginResult.user.role,
        firstName: loginResult.user.firstName,
        lastName: loginResult.user.lastName,
        accountStatus: loginResult.user.accountStatus,
      },
      exp: loginResult.exp,
    })
  } catch (error: any) {
    console.error('Erreur login:', error)
    
    // Gérer les erreurs de Payload
    if (error.message?.includes('Invalid login')) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la connexion', details: error.message },
      { status: 500 }
    )
  }
}
