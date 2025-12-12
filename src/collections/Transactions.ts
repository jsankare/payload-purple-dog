import type { CollectionConfig } from 'payload'

export const Transactions: CollectionConfig = {
  slug: 'transactions',
  labels: {
    singular: {
      en: 'Transaction',
      fr: 'Transaction',
    },
    plural: {
      en: 'Transactions',
      fr: 'Transactions',
    },
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['object', 'buyer', 'seller', 'totalAmount', 'status', 'createdAt'],
  },
  defaultSort: '-createdAt',
  access: {
    // Création: admin ou système (via overrideAccess)
    create: ({ req: { user } }) => {
      // Admin peut créer manuellement
      if (user?.role === 'admin') return true
      // Système peut créer via overrideAccess
      return false
    },

    // Lecture: admin voit tout, sinon seulement ses transactions (acheteur ou vendeur)
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true

      // Utilisateur voit ses transactions (acheteur ou vendeur)
      return {
        or: [
          { buyer: { equals: user.id } },
          { seller: { equals: user.id } },
        ] as const,
      }
    },

    // Mise à jour: admin uniquement
    update: ({ req: { user } }) => {
      return user?.role === 'admin'
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
    },
    {
      name: 'seller',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: {
        en: 'Seller',
        fr: 'Vendeur',
      },
    },
    {
      name: 'finalPrice',
      type: 'number',
      required: true,
      min: 0,
      label: {
        en: 'Final price',
        fr: 'Prix final',
      },
      admin: {
        description: {
          en: 'Final sale price of the object',
          fr: 'Prix de vente final de l\'objet',
        },
      },
    },
    {
      name: 'buyerCommission',
      type: 'number',
      required: true,
      min: 0,
      label: {
        en: 'Buyer commission',
        fr: 'Commission acheteur',
      },
      admin: {
        description: {
          en: 'Commission charged to buyer (from Settings)',
          fr: 'Commission facturée à l\'acheteur (depuis Settings)',
        },
      },
    },
    {
      name: 'sellerCommission',
      type: 'number',
      required: true,
      min: 0,
      label: {
        en: 'Seller commission',
        fr: 'Commission vendeur',
      },
      admin: {
        description: {
          en: 'Commission deducted from seller (from Settings)',
          fr: 'Commission déduite du vendeur (depuis Settings)',
        },
      },
    },
    {
      name: 'shippingCost',
      type: 'number',
      defaultValue: 0,
      min: 0,
      label: {
        en: 'Shipping cost',
        fr: 'Frais de livraison',
      },
    },
    {
      name: 'totalAmount',
      type: 'number',
      required: true,
      min: 0,
      label: {
        en: 'Total amount',
        fr: 'Montant total',
      },
      admin: {
        description: {
          en: 'Total paid by buyer (finalPrice + buyerCommission + shippingCost)',
          fr: 'Total payé par l\'acheteur (prix final + commission + livraison)',
        },
      },
    },
    {
      name: 'sellerAmount',
      type: 'number',
      required: true,
      min: 0,
      label: {
        en: 'Seller amount',
        fr: 'Montant vendeur',
      },
      admin: {
        description: {
          en: 'Amount received by seller (finalPrice - sellerCommission)',
          fr: 'Montant reçu par le vendeur (prix final - commission)',
        },
      },
    },
    {
      name: 'paymentIntentId',
      type: 'text',
      label: {
        en: 'Stripe Payment Intent ID',
        fr: 'ID Payment Intent Stripe',
      },
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'checkoutSessionId',
      type: 'text',
      label: {
        en: 'Stripe Checkout Session ID',
        fr: 'ID Session Checkout Stripe',
      },
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'paymentStatus',
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
            en: 'Held',
            fr: 'Bloqué',
          },
          value: 'held',
        },
        {
          label: {
            en: 'Released',
            fr: 'Libéré',
          },
          value: 'released',
        },
        {
          label: {
            en: 'Refunded',
            fr: 'Remboursé',
          },
          value: 'refunded',
        },
      ],
      admin: {
        description: {
          en: 'Stripe payment status',
          fr: 'Statut du paiement Stripe',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'payment_pending',
      options: [
        {
          label: {
            en: 'Payment pending',
            fr: 'Paiement en attente',
          },
          value: 'payment_pending',
        },
        {
          label: {
            en: 'Payment held',
            fr: 'Paiement bloqué',
          },
          value: 'payment_held',
        },
        {
          label: {
            en: 'Awaiting shipping',
            fr: 'En attente d\'expédition',
          },
          value: 'awaiting_shipping',
        },
        {
          label: {
            en: 'In transit',
            fr: 'En transit',
          },
          value: 'in_transit',
        },
        {
          label: {
            en: 'Delivered',
            fr: 'Livré',
          },
          value: 'delivered',
        },
        {
          label: {
            en: 'Completed',
            fr: 'Terminé',
          },
          value: 'completed',
        },
        {
          label: {
            en: 'Cancelled',
            fr: 'Annulé',
          },
          value: 'cancelled',
        },
        {
          label: {
            en: 'Disputed',
            fr: 'Litige',
          },
          value: 'disputed',
        },
      ],
      admin: {
        description: {
          en: 'Current transaction status',
          fr: 'Statut actuel de la transaction',
        },
      },
    },
    {
      name: 'shippingAddress',
      type: 'group',
      label: {
        en: 'Shipping address',
        fr: 'Adresse de livraison',
      },
      fields: [
        {
          name: 'street',
          type: 'text',
          label: {
            en: 'Street',
            fr: 'Rue',
          },
        },
        {
          name: 'city',
          type: 'text',
          label: {
            en: 'City',
            fr: 'Ville',
          },
        },
        {
          name: 'postalCode',
          type: 'text',
          label: {
            en: 'Postal code',
            fr: 'Code postal',
          },
        },
        {
          name: 'country',
          type: 'text',
          defaultValue: 'France',
          label: {
            en: 'Country',
            fr: 'Pays',
          },
        },
      ],
    },
    {
      name: 'billingAddress',
      type: 'group',
      label: {
        en: 'Billing address',
        fr: 'Adresse de facturation',
      },
      fields: [
        {
          name: 'street',
          type: 'text',
          label: {
            en: 'Street',
            fr: 'Rue',
          },
        },
        {
          name: 'city',
          type: 'text',
          label: {
            en: 'City',
            fr: 'Ville',
          },
        },
        {
          name: 'postalCode',
          type: 'text',
          label: {
            en: 'Postal code',
            fr: 'Code postal',
          },
        },
        {
          name: 'country',
          type: 'text',
          defaultValue: 'France',
          label: {
            en: 'Country',
            fr: 'Pays',
          },
        },
      ],
    },
    {
      name: 'shippingCarrier',
      type: 'text',
      label: {
        en: 'Shipping carrier',
        fr: 'Transporteur',
      },
      admin: {
        description: {
          en: 'Name of the shipping carrier',
          fr: 'Nom du transporteur',
        },
      },
    },
    {
      name: 'trackingNumber',
      type: 'text',
      label: {
        en: 'Tracking number',
        fr: 'Numéro de suivi',
      },
      admin: {
        description: {
          en: 'Shipping tracking number',
          fr: 'Numéro de suivi de livraison',
        },
      },
    },
    {
      name: 'paidAt',
      type: 'date',
      label: {
        en: 'Paid at',
        fr: 'Payé le',
      },
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: {
          en: 'When the payment was completed',
          fr: 'Quand le paiement a été effectué',
        },
      },
    },
    {
      name: 'shippedAt',
      type: 'date',
      label: {
        en: 'Shipped at',
        fr: 'Expédié le',
      },
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: {
          en: 'When the object was shipped',
          fr: 'Quand l\'objet a été expédié',
        },
      },
    },
    {
      name: 'deliveredAt',
      type: 'date',
      label: {
        en: 'Delivered at',
        fr: 'Livré le',
      },
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: {
          en: 'When the object was delivered',
          fr: 'Quand l\'objet a été livré',
        },
      },
    },
    {
      name: 'completedAt',
      type: 'date',
      label: {
        en: 'Completed at',
        fr: 'Terminé le',
      },
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: {
          en: 'When the transaction was completed (funds released)',
          fr: 'Quand la transaction a été finalisée (fonds libérés)',
        },
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: {
        en: 'Admin notes',
        fr: 'Notes administratives',
      },
      admin: {
        description: {
          en: 'Internal notes for administrators',
          fr: 'Notes internes pour les administrateurs',
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
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: {
          en: 'When the transaction was created',
          fr: 'Quand la transaction a été créée',
        },
      },
    },
  ],
}
