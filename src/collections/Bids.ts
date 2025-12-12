import type { CollectionConfig } from 'payload'

export const Bids: CollectionConfig = {
  slug: 'bids',
  labels: {
    singular: {
      en: 'Bid',
      fr: 'Enchère',
    },
    plural: {
      en: 'Bids',
      fr: 'Enchères',
    },
  },
  admin: {
    useAsTitle: 'amount',
    defaultColumns: ['object', 'bidder', 'amount', 'status'],
  },
  defaultSort: '-createdAt',
  access: {
    // Lecture: utilisateurs authentifiés uniquement
    read: ({ req: { user } }) => {
      return !!user
    },

    // Création: uniquement professionnels
    create: ({ req: { user } }) => {
      console.log('Bid Create Access Check - User:', user?.email, 'Role:', user?.role)
      return user?.role === 'professionnel'
    },

    // Mise à jour et suppression désactivées pour MVP
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'object',
      type: 'relationship',
      relationTo: 'objects',
      required: true,
      label: {
        en: 'Object',
        fr: 'Objet',
      },
    },
    {
      name: 'bidder',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: {
        en: 'Bidder',
        fr: 'Enchérisseur',
      },
      admin: {
        readOnly: true,
        description: {
          en: 'Automatically set to current user',
          fr: 'Défini automatiquement sur l\'utilisateur actuel',
        },
      },
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
      label: {
        en: 'Bid amount',
        fr: 'Montant de l\'enchère',
      },
    },
    {
      name: 'maxAutoBidAmount',
      type: 'number',
      required: false,
      min: 0,
      label: {
        en: 'Max auto-bid amount',
        fr: 'Montant max enchère auto',
      },
      admin: {
        description: {
          en: 'Maximum amount for automatic bidding',
          fr: 'Montant maximum pour les enchères automatiques',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        {
          label: {
            en: 'Pending',
            fr: 'En attente',
          },
          value: 'pending',
        },
        {
          label: {
            en: 'Highest',
            fr: 'Plus haute',
          },
          value: 'highest',
        },
        {
          label: {
            en: 'Outbid',
            fr: 'Surenchéri',
          },
          value: 'outbid',
        },
        {
          label: {
            en: 'Won',
            fr: 'Gagnée',
          },
          value: 'won',
        },
        {
          label: {
            en: 'Lost',
            fr: 'Perdue',
          },
          value: 'lost',
        },
        {
          label: {
            en: 'Canceled',
            fr: 'Annulée',
          },
          value: 'canceled',
        },
      ],
      admin: {
        description: {
          en: 'Current status of the bid',
          fr: 'Statut actuel de l\'enchère',
        },
      },
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'manual',
      options: [
        {
          label: {
            en: 'Manual',
            fr: 'Manuelle',
          },
          value: 'manual',
        },
        {
          label: {
            en: 'Auto',
            fr: 'Automatique',
          },
          value: 'auto',
        },
      ],
      admin: {
        description: {
          en: 'How the bid was placed',
          fr: 'Comment l\'enchère a été placée',
        },
      },
    },
    {
      name: 'createdAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        readOnly: true,
        description: {
          en: 'When the bid was placed',
          fr: 'Quand l\'enchère a été placée',
        },
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && data) {
          // Auto-définir le bidder sur l'utilisateur actuel si pas déjà défini
          if (!data.bidder && req.user?.id) {
            data.bidder = req.user.id
          }
        }
        return data
      },
    ],
  },
}
