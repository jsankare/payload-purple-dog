import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

const DEFAULT_CATEGORIES = [
  {
    name: 'Bijoux & montres',
    slug: 'bijoux-montres',
    description: 'Bijoux anciens, montres de collection, montres de luxe',
    order: 1,
    isActive: true,
    featuredOnHome: true,
  },
  {
    name: 'Meubles anciens',
    slug: 'meubles-anciens',
    description: 'Mobilier ancien, meubles d\'époque, antiquités',
    order: 2,
    isActive: true,
    featuredOnHome: true,
  },
  {
    name: 'Objets d\'art & tableaux',
    slug: 'objets-art-tableaux',
    description: 'Peintures, sculptures, objets d\'art',
    order: 3,
    isActive: true,
    featuredOnHome: true,
  },
  {
    name: 'Objets de collection',
    slug: 'objets-collection',
    description: 'Jouets, timbres, monnaies, cartes postales',
    order: 4,
    isActive: true,
    featuredOnHome: false,
  },
  {
    name: 'Vins & spiritueux de collection',
    slug: 'vins-spiritueux',
    description: 'Vins rares, spiritueux anciens, bouteilles de collection',
    order: 5,
    isActive: true,
    featuredOnHome: false,
  },
  {
    name: 'Instruments de musique',
    slug: 'instruments-musique',
    description: 'Instruments anciens, instruments de collection',
    order: 6,
    isActive: true,
    featuredOnHome: false,
  },
  {
    name: 'Livres anciens & manuscrits',
    slug: 'livres-manuscrits',
    description: 'Livres rares, éditions originales, manuscrits anciens',
    order: 7,
    isActive: true,
    featuredOnHome: false,
  },
  {
    name: 'Mode & accessoires de luxe',
    slug: 'mode-luxe',
    description: 'Vêtements de créateurs, sacs, accessoires de luxe',
    order: 8,
    isActive: true,
    featuredOnHome: true,
  },
  {
    name: 'Horlogerie & pendules anciennes',
    slug: 'horlogerie-pendules',
    description: 'Pendules anciennes, horloges de parquet, horlogerie d\'art',
    order: 9,
    isActive: true,
    featuredOnHome: false,
  },
  {
    name: 'Photographies anciennes & appareils vintage',
    slug: 'photographies-vintage',
    description: 'Photos anciennes, appareils photo vintage, matériel photographique',
    order: 10,
    isActive: true,
    featuredOnHome: false,
  },
  {
    name: 'Vaisselle, argenterie & cristallerie',
    slug: 'vaisselle-argenterie',
    description: 'Vaisselle ancienne, argenterie, cristal, porcelaine',
    order: 11,
    isActive: true,
    featuredOnHome: false,
  },
  {
    name: 'Sculptures & objets décoratifs',
    slug: 'sculptures-decoratifs',
    description: 'Sculptures, bronzes, objets décoratifs anciens',
    order: 12,
    isActive: true,
    featuredOnHome: false,
  },
  {
    name: 'Véhicules de collection',
    slug: 'vehicules-collection',
    description: 'Voitures anciennes, motos de collection, véhicules classiques',
    order: 13,
    isActive: true,
    featuredOnHome: false,
  },
]

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Vérifier si des catégories existent déjà
    const existingCategories = await payload.find({
      collection: 'categories',
      limit: 1,
    })

    if (existingCategories.totalDocs > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Categories already exist in database',
          count: existingCategories.totalDocs,
        },
        { status: 400 }
      )
    }

    // Créer toutes les catégories
    const createdCategories = []
    for (const category of DEFAULT_CATEGORIES) {
      const created = await payload.create({
        collection: 'categories',
        data: category,
      })
      createdCategories.push(created)
    }

    return NextResponse.json({
      success: true,
      message: `${createdCategories.length} categories created successfully`,
      categories: createdCategories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
      })),
    })
  } catch (error: any) {
    console.error('Error initializing categories:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}

// GET pour vérifier l'état
export async function GET() {
  try {
    const payload = await getPayload({ config })

    const categories = await payload.find({
      collection: 'categories',
      limit: 100,
    })

    return NextResponse.json({
      success: true,
      count: categories.totalDocs,
      categories: categories.docs.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        isActive: cat.isActive,
      })),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}
