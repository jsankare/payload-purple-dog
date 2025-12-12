import type { CollectionConfig } from 'payload'
<<<<<<< HEAD
import { ObjectsRowLabel } from '../components/ObjectsRowLabel'
=======
>>>>>>> origin/develop

export const Objects: CollectionConfig = {
  slug: 'objects',
  admin: {
    useAsTitle: 'name',
<<<<<<< HEAD
  },
  labels: {
    singular: { en: 'Object', fr: 'Objet' },
    plural: { en: 'Objects', fr: 'Objets' },
  },
  fields: [
    // Name
    {
      name: 'name',
      type: 'text',
      label: { en: 'Name of the object', fr: 'Nom de l\'objet' },
      required: true,
    },

    // Category
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      label: { en: 'Category', fr: 'Catégorie' },
      admin: {
        description: {
          en: 'Category of the object',
          fr: 'Catégorie de l\'objet',
        },
      },
    },

    // Dimensions
    {
      name: 'dimensions',
      type: 'group',
      label: { en: 'Dimensions and Weight', fr: 'Dimensions et Poids' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'height',
              type: 'number',
              label: { en: 'Height (cm)', fr: 'Hauteur (cm)' },
              required: true,
            },
            {
              name: 'width',
              type: 'number',
              label: { en: 'Width (cm)', fr: 'Largeur (cm)' },
              required: true,
            },
            {
              name: 'depth',
              type: 'number',
              label: { en: 'Depth (cm)', fr: 'Profondeur (cm)' },
              required: true,
            },
            {
              name: 'weight',
              type: 'number',
              label: { en: 'Weight (kg)', fr: 'Poids (kg)' },
              required: true,
            },
          ],
        },
      ],
      required: true,
    },

    // Description
    {
      name: 'description',
      type: 'textarea',
      label: { en: 'Description', fr: 'Description' },
      required: true,
    },

    // Documents
    {
      name: 'documents',
      type: 'array',
      label: { en: 'Documents', fr: 'Documents' },
      admin: {
        /* components: {
          RowLabel: ObjectsRowLabel,
        }, */
      },
      // required: true, // Optional for now
      fields: [
        {
          name: 'name',
          type: 'text',
          label: { en: 'Name', fr: 'Nom' },
          required: true,
        },
        {
          name: 'file',
          type: 'upload',
          label: { en: 'File', fr: 'Fichier' },
=======
    defaultColumns: ['name', 'category', 'seller', 'saleMode', 'status', 'price'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => {
      return user?.role === 'professionnel' || user?.role === 'admin'
    },
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      if (user) {
        return {
          seller: {
            equals: user.id,
          },
        }
      }
      return false
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nom de l\'objet',
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      label: 'Catégorie',
      options: [
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
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      label: 'Description',
    },

    {
      name: 'dimensions',
      type: 'group',
      label: 'Dimensions et poids',
      fields: [
        {
          name: 'length',
          type: 'number',
          required: true,
          label: 'Longueur (cm)',
        },
        {
          name: 'width',
          type: 'number',
          required: true,
          label: 'Largeur (cm)',
        },
        {
          name: 'height',
          type: 'number',
          required: true,
          label: 'Hauteur (cm)',
        },
        {
          name: 'weight',
          type: 'number',
          required: true,
          label: 'Poids (kg)',
        },
      ],
    },

    {
      name: 'documents',
      type: 'array',
      label: 'Documents',
      admin: {
        description: 'Certificats d\'authenticité, preuves d\'achat, etc.',
      },
      fields: [
        {
          name: 'document',
          type: 'upload',
>>>>>>> origin/develop
          relationTo: 'media',
          required: true,
        },
        {
          name: 'description',
<<<<<<< HEAD
          type: 'textarea',
          label: { en: 'Description', fr: 'Description' },
=======
          type: 'text',
          label: 'Description du document',
>>>>>>> origin/develop
        },
      ],
    },

<<<<<<< HEAD
    // Photos
    {
      name: 'photos',
      type: 'array',
      label: { en: 'Photos', fr: 'Photos' },
      minRows: 10,
      required: true,
      labels: {
        singular: { en: 'Photo', fr: 'Photo' },
        plural: { en: 'Photos', fr: 'Photos' },
      },
      admin: {
        /* components: {
          RowLabel: ObjectsRowLabel,
        }, */
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          label: { en: 'Name', fr: 'Nom' },
          required: true,
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: { en: 'Image', fr: 'Image' },
=======
    {
      name: 'photos',
      type: 'array',
      label: 'Photos',
      required: true,
      minRows: 10,
      maxRows: 20,
      admin: {
        description: 'Minimum 10 photos, maximum 20',
      },
      fields: [
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
          required: true,
>>>>>>> origin/develop
        },
      ],
    },

<<<<<<< HEAD
    // Seller
    {
      name: 'seller',
      type: 'relationship',
      label: { en: 'Seller', fr: 'Vendeur' },
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },

    // Sale mode
    {
      name: 'saleMode',
      type: 'select',
      label: { en: 'Sale mode', fr: 'Mode de vente' },
      required: true,
      defaultValue: 'quick_sale',
      options: [
        { label: { en: 'Quick sale', fr: 'Vente rapide' }, value: 'quick_sale' },
        { label: { en: 'Auction', fr: 'Enchère' }, value: 'auction' },
      ],
    },

    // Champs spécifiques Vente rapide
    {
      name: 'quickSalePrice',
      type: 'number',
      label: { en: 'Quick sale price', fr: 'Prix vente rapide' },
      required: true,
      admin: {
        condition: (_, siblingData) => siblingData?.saleMode === 'quick_sale',
      },
    },

    // Champs spécifiques Enchère
    {
      name: 'auctionStartPrice',
      type: 'number',
      label: { en: 'Starting bid', fr: 'Mise à prix' },
      required: true,
      admin: {
        condition: (_, siblingData) => siblingData?.saleMode === 'auction',
      },
    },
    {
      name: 'auctionEndDate',
      type: 'date',
      label: { en: 'Auction end', fr: 'Fin de l\'enchère' },
      required: true,
      admin: {
        condition: (_, siblingData) => siblingData?.saleMode === 'auction',
      },
    },

    // Status of the object
=======
    {
      name: 'price',
      type: 'number',
      required: true,
      label: 'Prix souhaité (€)',
      admin: {
        description: 'Prix que vous souhaitez obtenir',
      },
    },
    {
      name: 'saleMode',
      type: 'select',
      required: true,
      label: 'Mode de vente',
      options: [
        { label: 'Enchères', value: 'auction' },
        { label: 'Vente rapide', value: 'quick-sale' },
      ],
      defaultValue: 'auction',
    },

    {
      name: 'auctionConfig',
      type: 'group',
      label: 'Configuration des enchères',
      admin: {
        condition: (data) => data.saleMode === 'auction',
      },
      fields: [
        {
          name: 'startingPrice',
          type: 'number',
          label: 'Prix de démarrage (€)',
          admin: {
            description: 'Par défaut : -10% du prix souhaité',
          },
        },
        {
          name: 'reservePrice',
          type: 'number',
          label: 'Prix de réserve (€)',
          admin: {
            description: 'Prix minimum pour vendre',
          },
        },
        {
          name: 'duration',
          type: 'number',
          label: 'Durée (jours)',
          defaultValue: 7,
        },
        {
          name: 'startDate',
          type: 'date',
          label: 'Date de début',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'endDate',
          type: 'date',
          label: 'Date de fin',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'currentBid',
          type: 'number',
          label: 'Enchère actuelle (€)',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'bidCount',
          type: 'number',
          label: 'Nombre d\'enchères',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
      ],
    },

    {
      name: 'seller',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Vendeur',
      admin: {
        position: 'sidebar',
      },
    },

>>>>>>> origin/develop
    {
      name: 'status',
      type: 'select',
      required: true,
<<<<<<< HEAD
      defaultValue: 'draft',
      label: { en: 'Status', fr: 'Statut' },
      options: [
        { label: { en: 'Draft', fr: 'Brouillon' }, value: 'draft' },
        { label: { en: 'Active', fr: 'En vente' }, value: 'active' },
        { label: { en: 'Sold', fr: 'Vendu' }, value: 'sold' },
        { label: { en: 'Expired', fr: 'Expiré' }, value: 'expired' },
        { label: { en: 'Removed', fr: 'Retiré' }, value: 'removed' },
      ],
=======
      label: 'Statut',
      options: [
        { label: 'Brouillon', value: 'draft' },
        { label: 'En attente de validation', value: 'pending' },
        { label: 'Actif', value: 'active' },
        { label: 'Vendu', value: 'sold' },
        { label: 'Retiré', value: 'withdrawn' },
        { label: 'Rejeté', value: 'rejected' },
        { label: 'Expiré', value: 'expired' },
      ],
      defaultValue: 'active',
>>>>>>> origin/develop
      admin: {
        position: 'sidebar',
      },
    },

<<<<<<< HEAD
    // Reserve price (auctions only)
    {
      name: 'reservePrice',
      type: 'number',
      label: { en: 'Reserve price', fr: 'Prix de réserve' },
      admin: {
        condition: (_, siblingData) => siblingData?.saleMode === 'auction',
        description: {
          en: 'Minimum price required for the object to be sold',
          fr: 'Prix minimum pour que l\'objet soit vendu',
        },
      },
    },

    // Current auction state
    {
      name: 'currentBidAmount',
      type: 'number',
      label: { en: 'Current bid amount', fr: 'Enchère actuelle' },
      admin: {
        readOnly: true,
        condition: (_, siblingData) => siblingData?.saleMode === 'auction',
      },
    },
    {
      name: 'currentBidder',
      type: 'relationship',
      relationTo: 'users',
      label: { en: 'Current highest bidder', fr: 'Enchérisseur actuel' },
      admin: {
        readOnly: true,
        condition: (_, siblingData) => siblingData?.saleMode === 'auction',
      },
    },
    {
      name: 'bidCount',
      type: 'number',
      defaultValue: 0,
      label: { en: 'Number of bids', fr: 'Nombre d\'enchères' },
      admin: {
        readOnly: true,
      },
    },

    // Stats
    {
      name: 'viewCount',
      type: 'number',
      defaultValue: 0,
      label: { en: 'Number of views', fr: 'Nombre de vues' },
      admin: {
=======
    {
      name: 'buyer',
      type: 'relationship',
      relationTo: 'users',
      label: 'Acheteur',
      admin: {
        position: 'sidebar',
        condition: (data) => data.status === 'sold',
      },
    },
    {
      name: 'soldPrice',
      type: 'number',
      label: 'Prix de vente (€)',
      admin: {
        position: 'sidebar',
        condition: (data) => data.status === 'sold',
      },
    },
    {
      name: 'soldDate',
      type: 'date',
      label: 'Date de vente',
      admin: {
        position: 'sidebar',
        condition: (data) => data.status === 'sold',
      },
    },

    {
      name: 'views',
      type: 'number',
      label: 'Vues',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
>>>>>>> origin/develop
        readOnly: true,
      },
    },
    {
<<<<<<< HEAD
      name: 'favoriteCount',
      type: 'number',
      defaultValue: 0,
      label: { en: 'Number of favorites', fr: 'Nombre de favoris' },
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'auctionExtensions',
      type: 'number',
      defaultValue: 0,
      label: { en: 'Auction extensions', fr: 'Prolongations d\'enchère' },
      admin: {
        readOnly: true,
        condition: (_, siblingData) => siblingData?.saleMode === 'auction',
        description: {
          en: 'Number of times the auction end was extended by 10 minutes',
          fr: 'Nombre de fois que l\'enchère a été prolongée de 10 min',
        },
      },
    },

    // Timeline
    {
      name: 'publishedAt',
      type: 'date',
      label: { en: 'Published at', fr: 'Date de publication' },
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'soldAt',
      type: 'date',
      label: { en: 'Sold at', fr: 'Date de vente' },
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],

  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
        if (operation === 'create' && req.user) {
          return {
            ...data,
            seller: req.user.id,
          }
        }
=======
      name: 'favorites',
      type: 'number',
      label: 'Favoris',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        if (operation === 'create' && data.saleMode === 'auction') {
          const now = new Date()
          const endDate = new Date(now)
          endDate.setDate(endDate.getDate() + (data.auctionConfig?.duration || 7))

          if (!data.auctionConfig) {
            data.auctionConfig = {}
          }

          if (!data.auctionConfig.startingPrice && data.price) {
            data.auctionConfig.startingPrice = data.price * 0.9
          }

          if (!data.auctionConfig.reservePrice && data.price) {
            data.auctionConfig.reservePrice = data.price
          }

          if (!data.auctionConfig.startDate) {
            data.auctionConfig.startDate = now.toISOString()
          }
          if (!data.auctionConfig.endDate) {
            data.auctionConfig.endDate = endDate.toISOString()
          }
        }

>>>>>>> origin/develop
        return data
      },
    ],
  },
}
