import type { CollectionConfig } from 'payload'

export const Bids: CollectionConfig = {
  slug: 'bids',
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
  },
  fields: [
    {
      name: 'object',
      type: 'relationship',
      relationTo: 'objects',
      required: true,
      label: 'Objet',
    },

    {
      name: 'bidder',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Enchérisseur',
    },

    {
      name: 'amount',
      type: 'number',
      required: true,
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

    {
      name: 'status',
      type: 'select',
      required: true,
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
      },
    },
  ],
  hooks: {
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
