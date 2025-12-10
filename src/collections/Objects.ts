import type { CollectionConfig } from 'payload'

export const Objects: CollectionConfig = {
  slug: 'objects',
  admin: {
    useAsTitle: 'name',
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
          relationTo: 'media',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          label: 'Description du document',
        },
      ],
    },

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
        },
      ],
    },

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

    {
      name: 'status',
      type: 'select',
      required: true,
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
      admin: {
        position: 'sidebar',
      },
    },

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
        readOnly: true,
      },
    },
    {
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

        return data
      },
    ],
  },
}
