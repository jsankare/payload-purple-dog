import { NextRequest, NextResponse } from 'next/server'
import { getCachedPayload } from '@/lib/payload-singleton'

/**
 * Endpoint de vérification email optimisé
 * Contourne le bug de performance de payload.verifyEmail() dans Payload CMS 3.x
 * qui prend 30-120 secondes au lieu de <1 seconde.
 * 
 * NOTE: L'endpoint natif /api/users/verify/:token est trop lent même sans hooks.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const startTime = Date.now()

  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 400 }
      )
    }

    const payload = await getCachedPayload()

    // Trouver l'utilisateur avec ce token
    const users = await payload.find({
      collection: 'users',
      where: {
        _verificationToken: {
          equals: token,
        },
      },
      limit: 1,
      depth: 0, // Pas de population pour aller plus vite
    })

    if (users.docs.length === 0) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 400 }
      )
    }

    const user = users.docs[0]

    if (user._verified) {
      return NextResponse.json({
        message: 'Compte déjà vérifié',
        success: true,
      })
    }

    // Mise à jour DIRECTE en base de données sans passer par Payload
    // pour éviter les hooks et la lenteur de payload.update()
    const db = payload.db

    await db.updateOne({
      collection: 'users',
      where: { id: { equals: user.id } },
      data: {
        _verified: true,
        _verificationToken: null,
      },
    })

    const totalTime = Date.now() - startTime
    console.log(`[PERF] Fast verification (direct DB) took ${totalTime}ms`)

    return NextResponse.json({
      message: 'Compte vérifié avec succès.',
      success: true,
    })
  } catch (error: any) {
    const totalTime = Date.now() - startTime
    console.error(`Erreur vérification (${totalTime}ms):`, error)
    return NextResponse.json(
      { error: error.message || 'Erreur de vérification' },
      { status: 400 }
    )
  }
}
