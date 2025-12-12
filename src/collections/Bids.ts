import type { CollectionConfig } from 'payload'

export const Bids: CollectionConfig = {
  slug: 'bids',
<<<<<<< HEAD
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
=======
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['object', 'bidder', 'amount', 'createdAt', 'status'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => {
      return user?.role === 'professionnel' || user?.role === 'admin'
    },
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
>>>>>>> origin/develop
  },
  fields: [
    {
      name: 'object',
      type: 'relationship',
      relationTo: 'objects',
      required: true,
<<<<<<< HEAD
      label: {
        en: 'Object',
        fr: 'Objet',
      },
    },
=======
      label: 'Objet',
    },

>>>>>>> origin/develop
    {
      name: 'bidder',
      type: 'relationship',
      relationTo: 'users',
      required: true,
<<<<<<< HEAD
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
=======
      label: 'Enchérisseur',
    },

>>>>>>> origin/develop
    {
      name: 'amount',
      type: 'number',
      required: true,
<<<<<<< HEAD
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
=======
      label: 'Montant (€)',
    },

    {
      name: 'bidType',
      type: 'select',
      required: true,
      label: 'Type d\'enchère',
      options: [
        { label: 'Manuelle', value: 'manual' },
        { label: 'Automatique', value: 'automatic' },
      ],
      defaultValue: 'manual',
    },

    {
      name: 'maxAutoBid',
      type: 'number',
      label: 'Enchère automatique max (€)',
      admin: {
        description: 'Si enchère automatique, montant maximum à enchérir',
        condition: (data) => data.bidType === 'automatic',
      },
    },

>>>>>>> origin/develop
    {
      name: 'status',
      type: 'select',
      required: true,
<<<<<<< HEAD
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
=======
      label: 'Statut',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Surenchérie', value: 'outbid' },
        { label: 'Gagnante', value: 'winning' },
        { label: 'Perdue', value: 'lost' },
      ],
      defaultValue: 'active',
    },

    {
      name: 'notified',
      type: 'checkbox',
      label: 'Notification envoyée',
      defaultValue: false,
      admin: {
        description: 'Email de notification envoyé à l\'enchérisseur',
>>>>>>> origin/develop
      },
    },
  ],
  hooks: {
<<<<<<< HEAD
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
=======
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation === 'create') {
          const payload = req.payload
          const object = await payload.findByID({
            collection: 'objects',
            id: data.object,
          })

          if (!object) {
            throw new Error('Objet non trouvé')
          }

          if (object.saleMode !== 'auction') {
            throw new Error('Cet objet n\'est pas en mode enchères')
          }

          if (object.status !== 'active') {
            throw new Error('Cet objet n\'est pas actif')
          }

          const currentBid = object.auctionConfig?.currentBid || object.auctionConfig?.startingPrice || 0
          
          if (data.amount <= currentBid) {
            throw new Error(`L'enchère doit être supérieure à ${currentBid}€`)
          }

          const minIncrement = calculateBidIncrement(currentBid)
          if (data.amount < currentBid + minIncrement) {
            throw new Error(`Le palier minimum est de ${minIncrement}€`)
          }

          if (data.bidder === object.seller) {
            throw new Error('Le vendeur ne peut pas enchérir sur son propre objet')
          }
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          const payload = req.payload
          const object = await payload.findByID({
            collection: 'objects',
            id: doc.object,
          })

          await payload.update({
            collection: 'objects',
            id: doc.object,
            data: {
              auctionConfig: {
                ...object.auctionConfig,
                currentBid: doc.amount,
                bidCount: (object.auctionConfig?.bidCount || 0) + 1,
              },
            },
          })

          const otherBids = await payload.find({
            collection: 'bids',
            where: {
              and: [
                { object: { equals: doc.object } },
                { id: { not_equals: doc.id } },
                { status: { equals: 'active' } },
              ],
            },
          })

          for (const bid of otherBids.docs) {
            await payload.update({
              collection: 'bids',
              id: bid.id,
              data: {
                status: 'outbid',
              },
            })

            // TODO: Envoyer notification de surenchère
          }

          await payload.update({
            collection: 'bids',
            id: doc.id,
            data: {
              status: 'winning',
            },
          })
        }

        return doc
      },
    ],
  },
}

function calculateBidIncrement(currentPrice: number): number {
  if (currentPrice < 100) return 10
  if (currentPrice < 500) return 50
  if (currentPrice < 1000) return 100
  if (currentPrice < 5000) return 200
  if (currentPrice < 10000) return 500
  return 1000
}
>>>>>>> origin/develop
