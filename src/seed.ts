import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Seed script for Purple Dog platform
 * 
 * Seeds:
 * - 13 categories
 * - 6 users (3 particuliers + 3 pros)
 * - 20 objects (auctions and quick sales)
 */

// Categories data
const categories = [
  { name: 'Bijoux & Montres', slug: 'bijoux-montres', description: 'Montres de luxe, bijoux anciens et modernes', isActive: true, order: 1 },
  { name: 'Meubles Anciens', slug: 'meubles-anciens', description: 'Mobilier d\'époque, antiquités', isActive: true, order: 2 },
  { name: 'Art & Tableaux', slug: 'art-tableaux', description: 'Peintures, sculptures, œuvres d\'art', isActive: true, order: 3 },
  { name: 'Vins & Spiritueux', slug: 'vins-spiritueux', description: 'Grands crus, whiskies rares', isActive: true, order: 4 },
  { name: 'Livres Rares', slug: 'livres-rares', description: 'Éditions originales, manuscrits', isActive: true, order: 5 },
  { name: 'Instruments de Musique', slug: 'instruments-musique', description: 'Instruments anciens et de collection', isActive: true, order: 6 },
  { name: 'Voitures de Collection', slug: 'voitures-collection', description: 'Automobiles anciennes et rares', isActive: true, order: 7 },
  { name: 'Timbres & Monnaies', slug: 'timbres-monnaies', description: 'Philatélie, numismatique', isActive: true, order: 8 },
  { name: 'Céramiques & Porcelaines', slug: 'ceramiques-porcelaines', description: 'Faïences, porcelaines anciennes', isActive: true, order: 9 },
  { name: 'Argenterie', slug: 'argenterie', description: 'Couverts, objets en argent massif', isActive: true, order: 10 },
  { name: 'Textiles Anciens', slug: 'textiles-anciens', description: 'Tapisseries, tissus d\'époque', isActive: true, order: 11 },
  { name: 'Objets Scientifiques', slug: 'objets-scientifiques', description: 'Instruments scientifiques anciens', isActive: true, order: 12 },
  { name: 'Militaria', slug: 'militaria', description: 'Objets militaires de collection', isActive: true, order: 13 },
]

// Users data
const particuliers = [
  {
    email: 'jean.dupont@example.com',
    password: 'password123',
    role: 'particulier',
    firstName: 'Jean',
    lastName: 'Dupont',
    isOver18: true,
    acceptedGDPR: true,
    address: {
      street: '123 Rue de la Paix',
      city: 'Paris',
      postalCode: '75001',
      country: 'France',
    },
  },
  {
    email: 'marie.martin@example.com',
    password: 'password123',
    role: 'particulier',
    firstName: 'Marie',
    lastName: 'Martin',
    isOver18: true,
    acceptedGDPR: true,
    address: {
      street: '45 Avenue des Champs',
      city: 'Lyon',
      postalCode: '69001',
      country: 'France',
    },
  },
  {
    email: 'pierre.bernard@example.com',
    password: 'password123',
    role: 'particulier',
    firstName: 'Pierre',
    lastName: 'Bernard',
    isOver18: true,
    acceptedGDPR: true,
    address: {
      street: '78 Boulevard Victor Hugo',
      city: 'Marseille',
      postalCode: '13001',
      country: 'France',
    },
  },
]

const professionnels = [
  {
    email: 'contact@antiquites-durand.fr',
    password: 'password123',
    role: 'professionnel',
    firstName: 'Sophie',
    lastName: 'Durand',
    companyName: 'Antiquités Durand',
    siret: '12345678901234',
    acceptedGDPR: true,
    acceptedTerms: true,
    acceptedMandate: true,
    address: {
      street: '15 Rue des Antiquaires',
      city: 'Paris',
      postalCode: '75006',
      country: 'France',
    },
  },
  {
    email: 'info@galerie-moderne.fr',
    password: 'password123',
    role: 'professionnel',
    firstName: 'Laurent',
    lastName: 'Petit',
    companyName: 'Galerie Moderne',
    siret: '98765432109876',
    acceptedGDPR: true,
    acceptedTerms: true,
    acceptedMandate: true,
    address: {
      street: '32 Avenue Montaigne',
      city: 'Paris',
      postalCode: '75008',
      country: 'France',
    },
  },
  {
    email: 'ventes@maison-encheres.fr',
    password: 'password123',
    role: 'professionnel',
    firstName: 'Isabelle',
    lastName: 'Moreau',
    companyName: 'Maison des Enchères',
    siret: '11223344556677',
    acceptedGDPR: true,
    acceptedTerms: true,
    acceptedMandate: true,
    address: {
      street: '88 Rue du Faubourg Saint-Honoré',
      city: 'Paris',
      postalCode: '75008',
      country: 'France',
    },
  },
]

// Objects data templates
const objectTemplates = [
  { name: 'Montre Rolex Submariner 1960', description: 'Montre de plongée vintage en excellent état, cadran noir, bracelet acier.', saleMode: 'auction', auctionStartPrice: 8000, reservePrice: 10000 },
  { name: 'Commode Louis XV', description: 'Commode en marqueterie du XVIIIe siècle, dessus marbre, estampillée.', saleMode: 'auction', auctionStartPrice: 5000, reservePrice: 7000 },
  { name: 'Tableau Paysage Impressionniste', description: 'Huile sur toile signée, école française XIXe, encadrement d\'époque.', saleMode: 'quick_sale', quickSalePrice: 3500 },
  { name: 'Château Margaux 1990', description: 'Bouteille grand cru classé, conservation parfaite, étiquette impeccable.', saleMode: 'auction', auctionStartPrice: 400, reservePrice: 600 },
  { name: 'Édition Originale Victor Hugo', description: 'Les Misérables, première édition 1862, reliure d\'époque en cuir.', saleMode: 'quick_sale', quickSalePrice: 2800 },
  { name: 'Violon Stradivarius Copie', description: 'Copie de qualité supérieure, son exceptionnel, certificat d\'authenticité.', saleMode: 'auction', auctionStartPrice: 3000, reservePrice: 4000 },
  { name: 'Porsche 911 Carrera 1985', description: 'Voiture de collection, 120000 km, état impeccable, historique complet.', saleMode: 'auction', auctionStartPrice: 45000, reservePrice: 55000 },
  { name: 'Collection Timbres France', description: 'Album complet 1900-1950, timbres neufs et oblitérés, très bon état.', saleMode: 'quick_sale', quickSalePrice: 1200 },
  { name: 'Vase Chine Dynastie Qing', description: 'Porcelaine bleu et blanc, décor dragons, certificat d\'expertise.', saleMode: 'auction', auctionStartPrice: 2000, reservePrice: 3000 },
  { name: 'Service Argenterie Christofle', description: 'Service 12 personnes, modèle Malmaison, poinçons visibles.', saleMode: 'quick_sale', quickSalePrice: 4500 },
  { name: 'Tapisserie Aubusson XVIIIe', description: 'Scène pastorale, dimensions 2m x 1.5m, restauration professionnelle.', saleMode: 'auction', auctionStartPrice: 6000, reservePrice: 8000 },
  { name: 'Télescope Astronomique Ancien', description: 'Lunette astronomique laiton XIXe, trépied bois, optique parfaite.', saleMode: 'quick_sale', quickSalePrice: 1800 },
  { name: 'Sabre Officier Napoléon', description: 'Sabre d\'officier Premier Empire, fourreau cuir, gravures d\'époque.', saleMode: 'auction', auctionStartPrice: 1500, reservePrice: 2000 },
  { name: 'Pendule Bronze Doré', description: 'Pendule époque Empire, mouvement mécanique révisé, marbre noir.', saleMode: 'quick_sale', quickSalePrice: 2200 },
  { name: 'Carte Géographique Ancienne', description: 'Carte de France XVIIe siècle, gravure sur cuivre, coloris d\'époque.', saleMode: 'auction', auctionStartPrice: 800, reservePrice: 1200 },
  { name: 'Sculpture Bronze Barye', description: 'Lion au serpent, fonte d\'édition XIXe, patine brune, signée.', saleMode: 'quick_sale', quickSalePrice: 5500 },
  { name: 'Appareil Photo Leica M3', description: 'Boîtier argentique vintage 1954, objectif Summicron 50mm, état collection.', saleMode: 'auction', auctionStartPrice: 2500, reservePrice: 3500 },
  { name: 'Horloge Comtoise XVIIIe', description: 'Mécanisme complet fonctionnel, caisse chêne sculpté, cadran émaillé.', saleMode: 'quick_sale', quickSalePrice: 3200 },
  { name: 'Jumelles Marines Anciennes', description: 'Jumelles laiton début XXe, optique Carl Zeiss, étui cuir d\'origine.', saleMode: 'auction', auctionStartPrice: 600, reservePrice: 900 },
  { name: 'Encrier Bronze Napoléon III', description: 'Encrier double en bronze doré, décor néoclassique, encriers cristal.', saleMode: 'quick_sale', quickSalePrice: 850 },
]

async function seed() {
  try {
    console.log('🌱 Démarrage du seed...')

    // Initialize Payload
    const payload = await getPayload({ config })
    console.log('✅ Payload initialisé')

    // 1. SEED CATEGORIES
    console.log('\n📁 Création des catégories...')
    const createdCategories = []

    for (const category of categories) {
      const created = await payload.create({
        collection: 'categories',
        data: category,
      })
      createdCategories.push(created)
      console.log(`  ✓ ${category.name}`)
    }
    console.log(`✅ ${createdCategories.length} catégories créées`)

    // 2. SEED USERS
    console.log('\n👥 Création des utilisateurs...')
    const createdUsers = []

    // Create particuliers
    for (const user of particuliers) {
      const created = await payload.create({
        collection: 'users',
        data: user,
      })
      createdUsers.push(created)
      console.log(`  ✓ Particulier: ${user.email}`)
    }

    // Create professionnels
    for (const user of professionnels) {
      const created = await payload.create({
        collection: 'users',
        data: user,
      })
      createdUsers.push(created)
      console.log(`  ✓ Professionnel: ${user.email} (${user.companyName})`)
    }
    console.log(`✅ ${createdUsers.length} utilisateurs créés`)

    // 3. SEED OBJECTS
    console.log('\n🎨 Création des objets...')
    const createdObjects = []

    for (const template of objectTemplates) {
      // Random user (seller)
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)]

      // Random category
      const randomCategory = createdCategories[Math.floor(Math.random() * createdCategories.length)]

      // Prepare object data
      const objectData: any = {
        name: template.name,
        description: template.description,
        category: randomCategory.id,
        seller: randomUser.id,
        saleMode: template.saleMode,
        status: 'active',
        dimensions: {
          height: Math.floor(Math.random() * 50) + 10,
          width: Math.floor(Math.random() * 50) + 10,
          depth: Math.floor(Math.random() * 30) + 5,
          weight: Math.random() * 10 + 0.5,
        },
        viewCount: Math.floor(Math.random() * 100),
        favoriteCount: Math.floor(Math.random() * 20),
        publishedAt: new Date().toISOString(),
      }

      // Add mode-specific fields
      if (template.saleMode === 'auction') {
        const now = new Date()
        const endDate = new Date(now.getTime() + (Math.floor(Math.random() * 5) + 2) * 24 * 60 * 60 * 1000) // 2-7 days

        objectData.auctionStartPrice = template.auctionStartPrice
        objectData.reservePrice = template.reservePrice
        objectData.auctionStartDate = now.toISOString()
        objectData.auctionEndDate = endDate.toISOString()
        objectData.bidCount = 0
        objectData.auctionExtensions = 0
      } else {
        objectData.quickSalePrice = template.quickSalePrice
      }

      const created = await payload.create({
        collection: 'objects',
        data: objectData,
      })
      createdObjects.push(created)
      console.log(`  ✓ ${template.name} (${template.saleMode})`)
    }
    console.log(`✅ ${createdObjects.length} objets créés`)

    // Summary
    console.log('\n🎉 Seed terminé avec succès!')
    console.log('📊 Résumé:')
    console.log(`  - Catégories: ${createdCategories.length}`)
    console.log(`  - Utilisateurs: ${createdUsers.length}`)
    console.log(`  - Objets: ${createdObjects.length}`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error)
    process.exit(1)
  }
}

// Run seed
seed()
