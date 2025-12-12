import type { CollectionConfig } from 'payload'

export const Offers: CollectionConfig = {
  slug: 'offers',
  labels: {
    singular: {
      en: 'Offer',
      fr: 'Offre',
    },
    plural: {
      en: 'Offers',
      fr: 'Offres',
    },
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['object', 'buyer', 'amount', 'status', 'createdAt'],
  },
  defaultSort: '-createdAt',
  access: {
    // Création: pros avec abonnement actif uniquement
    create: ({ req }) => {
      return req.user?.role === 'professionnel' && req.user?.subscriptionStatus === 'active'
    },

    // Lecture: admin tout voir, sinon seulement ses propres offres
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true

      // Utilisateur ne voit que ses offres
      return {
        buyer: {
          equals: user.id,
        },
      }
    },

    // Mise à jour: admin uniquement
    update: ({ req }) => {
      return req.user?.role === 'admin'
    },

    // Suppression: désactivée
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
      name: 'buyer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: {
        en: 'Buyer',
        fr: 'Acheteur',
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
        en: 'Offered amount',
        fr: 'Montant proposé',
      },
    },
    {
      name: 'message',
      type: 'textarea',
      maxLength: 500,
      label: {
        en: 'Message',
        fr: 'Message',
      },
      admin: {
        description: {
          en: 'Message to the seller (will be filtered for contact information)',
          fr: 'Message au vendeur (sera filtré pour les coordonnées)',
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
            en: 'Accepted',
            fr: 'Acceptée',
          },
          value: 'accepted',
        },
        {
          label: {
            en: 'Rejected',
            fr: 'Rejetée',
          },
          value: 'rejected',
        },
        {
          label: {
            en: 'Expired',
            fr: 'Expirée',
          },
          value: 'expired',
        },
      ],
      admin: {
        description: {
          en: 'Current status of the offer',
          fr: 'Statut actuel de l\'offre',
        },
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      label: {
        en: 'Expires at',
        fr: 'Expire le',
      },
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: {
          en: 'When the offer expires',
          fr: 'Quand l\'offre expire',
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
          en: 'When the offer was created',
          fr: 'Quand l\'offre a été créée',
        },
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && data) {
          // Auto-définir le buyer sur l'utilisateur actuel
          data.buyer = req.user?.id

          // Filtrage basique du message (regex coordonnées)
          if (data.message) {
            const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/gi
            const phoneRegex = /(\+33|0)[1-9](\d{2}){4}/g

            if (emailRegex.test(data.message) || phoneRegex.test(data.message)) {
              throw new Error('Le message ne peut pas contenir d\'email ou de numéro de téléphone')
            }
          }

          // Définir expiresAt par défaut à 7 jours si non défini
          if (!data.expiresAt) {
            const expirationDate = new Date()
            expirationDate.setDate(expirationDate.getDate() + 7)
            data.expiresAt = expirationDate.toISOString()
          }
        }
        return data
      },
    ],
  },
}
