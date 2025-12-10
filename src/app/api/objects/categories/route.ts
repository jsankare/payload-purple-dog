import { NextResponse } from 'next/server'

/**
 * Route pour récupérer les catégories d'objets
 * GET /api/objects/categories
 */
export async function GET() {
  const categories = [
    { label: 'Bijoux & montres', value: 'bijoux-montres' },
    { label: 'Meubles anciens', value: 'meubles-anciens' },
    { label: 'Objets d\'art & tableaux', value: 'objets-art-tableaux' },
    { label: 'Objets de collection (jouets, timbres, monnaies…)', value: 'objets-collection' },
    { label: 'Vins & spiritueux de collection', value: 'vins-spiritueux' },
    { label: 'Instruments de musique', value: 'instruments-musique' },
    { label: 'Livres anciens & manuscrits', value: 'livres-manuscrits' },
    { label: 'Mode & accessoires de luxe', value: 'mode-luxe' },
    { label: 'Horlogerie & pendules anciennes', value: 'horlogerie-pendules' },
    { label: 'Photographies anciennes & appareils vintage', value: 'photographies-vintage' },
    { label: 'Vaisselle & argenterie & cristallerie', value: 'vaisselle-argenterie' },
    { label: 'Sculptures & objets décoratifs', value: 'sculptures-decoratifs' },
    { label: 'Véhicules de collection', value: 'vehicules-collection' },
  ]

  return NextResponse.json({ categories })
}
