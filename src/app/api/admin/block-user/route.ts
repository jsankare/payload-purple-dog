import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * Route pour bloquer/débloquer un utilisateur (Admin uniquement)
 * POST /api/admin/block-user
 * Body: { userId: number, action: 'block' | 'unblock' }
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

    // Vérifier que l'utilisateur est admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès refusé. Admin uniquement.' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { userId, action } = body

    // Validation
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

    // Vérifier que l'utilisateur existe
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

    // Empêcher de bloquer un admin
    if (targetUser.role === 'admin') {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas bloquer un administrateur' },
        { status: 403 }
      )
    }

    // Empêcher de se bloquer soi-même
    if (targetUser.id === user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas vous bloquer vous-même' },
        { status: 403 }
      )
    }

    // Déterminer le nouveau statut
    const newStatus = action === 'block' ? 'suspended' : 'active'

    // Mettre à jour le statut
    const updatedUser = await payload.update({
      collection: 'users',
      id: userId,
      data: {
        accountStatus: newStatus,
      },
    })

    // Si on bloque, déconnecter l'utilisateur (supprimer ses sessions)
    if (action === 'block') {
      try {
        await payload.update({
          collection: 'users',
          id: userId,
          data: {
            sessions: [], // Vider les sessions
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
