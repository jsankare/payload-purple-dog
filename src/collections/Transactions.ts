import type { CollectionConfig } from 'payload'

export const Transactions: CollectionConfig = {
  slug: 'transactions',
  admin: {
    useAsTitle: 'transactionId',
    defaultColumns: ['transactionId', 'type', 'amount', 'status', 'createdAt'],
    description: 'Gestion de la comptabilité et des transactions',
    group: 'Administration',
  },
  access: {
    read: ({ req: { user } }) => user?.role === 'admin',
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'transactionId',
      type: 'text',
      required: true,
      unique: true,
      label: 'ID Transaction',
      admin: {
        description: 'Identifiant unique de la transaction',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      label: 'Type de Transaction',
      options: [
        { label: 'Vente - Paiement Acheteur', value: 'sale_payment' },
        { label: 'Vente - Commission Plateforme', value: 'platform_commission' },
        { label: 'Vente - Versement Vendeur', value: 'seller_payout' },
        { label: 'Abonnement', value: 'subscription' },
        { label: 'Remboursement', value: 'refund' },
        { label: 'Litige', value: 'dispute' },
      ],
    },

    {
      name: 'buyer',
      type: 'relationship',
      relationTo: 'users',
      label: 'Acheteur',
      admin: {
        condition: (data) => ['sale_payment', 'refund'].includes(data.type),
      },
    },
    {
      name: 'seller',
      type: 'relationship',
      relationTo: 'users',
      label: 'Vendeur',
      admin: {
        condition: (data) => ['seller_payout', 'sale_payment'].includes(data.type),
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      label: 'Utilisateur',
      admin: {
        condition: (data) => data.type === 'subscription',
      },
    },

    {
      name: 'object',
      type: 'relationship',
      relationTo: 'objects',
      label: 'Objet',
      admin: {
        condition: (data) => [
          'sale_payment',
          'platform_commission',
          'seller_payout',
          'refund',
        ].includes(data.type),
      },
    },

    {
      name: 'amount',
      type: 'number',
      required: true,
      label: 'Montant (€)',
      min: 0,
      admin: {
        description: 'Montant de la transaction en euros',
        step: 0.01,
      },
    },
    {
      name: 'buyerCommission',
      type: 'number',
      label: 'Commission Acheteur (€)',
      min: 0,
      admin: {
        condition: (data) => data.type === 'sale_payment',
        step: 0.01,
      },
    },
    {
      name: 'sellerCommission',
      type: 'number',
      label: 'Commission Vendeur (€)',
      min: 0,
      admin: {
        condition: (data) => data.type === 'seller_payout',
        step: 0.01,
      },
    },
    {
      name: 'platformRevenue',
      type: 'number',
      label: 'Revenu Plateforme (€)',
      min: 0,
      admin: {
        condition: (data) => data.type === 'platform_commission',
        step: 0.01,
        description: 'Commission totale prélevée par la plateforme',
      },
    },

    {
      name: 'status',
      type: 'select',
      required: true,
      label: 'Statut',
      defaultValue: 'pending',
      options: [
        { label: 'En attente', value: 'pending' },
        { label: 'En cours', value: 'processing' },
        { label: 'Complété', value: 'completed' },
        { label: 'Échoué', value: 'failed' },
        { label: 'Remboursé', value: 'refunded' },
        { label: 'Annulé', value: 'canceled' },
      ],
    },

    {
      name: 'paymentMethod',
      type: 'select',
      label: 'Méthode de Paiement',
      options: [
        { label: 'Carte Bancaire', value: 'card' },
        { label: 'Virement', value: 'bank_transfer' },
        { label: 'PayPal', value: 'paypal' },
        { label: 'Stripe', value: 'stripe' },
      ],
    },
    {
      name: 'stripePaymentIntentId',
      type: 'text',
      label: 'Stripe Payment Intent ID',
      admin: {
        condition: (data) => data.paymentMethod === 'stripe',
        description: 'ID Stripe du paiement',
      },
    },
    {
      name: 'stripeTransferId',
      type: 'text',
      label: 'Stripe Transfer ID',
      admin: {
        condition: (data) => data.type === 'seller_payout',
        description: 'ID Stripe du versement au vendeur',
      },
    },

    {
      name: 'processedAt',
      type: 'date',
      label: 'Date de Traitement',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'completedAt',
      type: 'date',
      label: 'Date de Complétion',
      admin: {
        condition: (data) => data.status === 'completed',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },

    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'Description détaillée de la transaction',
      },
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      label: 'Notes Internes',
      admin: {
        description: 'Notes internes pour l\'administration',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      label: 'Métadonnées',
      admin: {
        description: 'Données techniques supplémentaires (JSON)',
      },
    },

    {
      name: 'invoiceNumber',
      type: 'text',
      label: 'Numéro de Facture',
      admin: {
        description: 'Numéro de facture généré',
      },
    },
    {
      name: 'invoiceUrl',
      type: 'text',
      label: 'URL Facture',
      admin: {
        description: 'Lien vers la facture PDF',
      },
    },
    {
      name: 'fiscalYear',
      type: 'number',
      label: 'Année Fiscale',
      admin: {
        description: 'Année fiscale de la transaction',
      },
    },
    {
      name: 'isReconciled',
      type: 'checkbox',
      label: 'Rapprochement Bancaire Effectué',
      defaultValue: false,
      admin: {
        description: 'Transaction rapprochée avec le relevé bancaire',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create' && !data.transactionId) {
          const date = new Date()
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const random = Math.random().toString(36).substring(2, 8).toUpperCase()
          data.transactionId = `TR${year}${month}${random}`
        }

        if (!data.fiscalYear) {
          data.fiscalYear = new Date().getFullYear()
        }
        if (data.status === 'processing' && !data.processedAt) {
          data.processedAt = new Date().toISOString()
        }
        if (data.status === 'completed' && !data.completedAt) {
          data.completedAt = new Date().toISOString()
        }

        return data
      },
    ],
  },
}
