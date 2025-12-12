import { NextRequest, NextResponse } from 'next/server'
import { getCachedPayload } from '@/lib/payload-singleton'
import { cookies } from 'next/headers'

/**
 * Endpoint de login optimisé
 * Contourne le bug de performance du login natif Payload CMS 3.x
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now()

  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    const payload = await getCachedPayload()

    // Utiliser la méthode login de Payload (elle est rapide, c'est le reste qui est lent)
    const result = await payload.login({
      collection: 'users',
      data: {
        email,
        password,
      },
    })

    if (!result.user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Vérifier si l'utilisateur est vérifié
    if (!result.user._verified) {
      return NextResponse.json(
        { error: 'Veuillez vérifier votre email avant de vous connecter' },
        { status: 403 }
      )
    }

    const totalTime = Date.now() - startTime
    console.log(`[PERF] Fast login took ${totalTime}ms`)

    // Créer la réponse avec le cookie
    const response = NextResponse.json({
      user: result.user,
      token: result.token,
      exp: result.exp,
      message: 'Connexion réussie',
    })

    // Définir le cookie payload-token
    if (result.token) {
      response.cookies.set('payload-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 heures
      })
    }

    return response
  } catch (error: any) {
    const totalTime = Date.now() - startTime
    console.error(`Erreur login (${totalTime}ms):`, error)

    // Gérer les erreurs d'authentification Payload
    if (error.message?.includes('credentials') || error.message?.includes('Invalid')) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erreur de connexion' },
      { status: 400 }
    )
  }
}
