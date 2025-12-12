import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * POST /api/admin/block-user
 * Block/unblock user (Admin only)
 * @param userId - User ID to block/unblock
 * @param action - 'block' or 'unblock'
 */

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })

    const { user } = await payload.auth({ headers: req.headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès refusé. Admin uniquement.' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { userId, action } = body

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'userId et action sont requis' },
        { status: 400 }
      )
    }

    if (action !== 'block' && action !== 'unblock') {
      return NextResponse.json(
        { error: 'action doit être "block" ou "unblock"' },
        { status: 400 }
      )
    }

    const targetUser = await payload.findByID({
      collection: 'users',
      id: userId,
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    /** Prevent blocking admins */
    if (targetUser.role === 'admin') {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas bloquer un administrateur' },
        { status: 403 }
      )
    }

    /** Prevent self-blocking */
    if (targetUser.id === user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas vous bloquer vous-même' },
        { status: 403 }
      )
    }

    const newStatus = action === 'block' ? 'suspended' : 'active'

    const updatedUser = await payload.update({
      collection: 'users',
      id: userId,
      data: {
        accountStatus: newStatus,
      },
    })

    /** Clear user sessions when blocking */
    if (action === 'block') {
      try {
        await payload.update({
          collection: 'users',
          id: userId,
          data: {
            sessions: [],
          },
        })
      } catch (error) {
        console.error('Erreur lors de la suppression des sessions:', error)
      }
    }

    return NextResponse.json({
      success: true,
      message: action === 'block'
        ? `Utilisateur ${targetUser.email} bloqué avec succès`
        : `Utilisateur ${targetUser.email} débloqué avec succès`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        accountStatus: updatedUser.accountStatus,
      },
    })
  } catch (error: any) {
    console.error('Erreur blocage/déblocage utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'opération', details: error.message },
      { status: 500 }
    )
  }
}
