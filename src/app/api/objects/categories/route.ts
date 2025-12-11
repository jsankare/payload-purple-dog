import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Route pour récupérer les catégories d'objets depuis la BDD
 * GET /api/objects/categories
 */
export async function GET() {
  try {
    const payload = await getPayload({ config })
    
    const { docs } = await payload.find({
      collection: 'categories',
      limit: 100,
      sort: 'name',
    })

    const categories = docs.map(cat => ({
      label: cat.name,
      value: cat.slug,
    }))

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des catégories' },
      { status: 500 }
    )
  }
}
