import type { CollectionConfig } from 'payload'

export const Subscriptions: CollectionConfig = {
  slug: 'subscriptions',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'plan', 'status', 'currentPeriodEnd'],
    description: 'Historique et gestion des abonnements utilisateurs',
  },
  access: {
    // Les utilisateurs peuvent voir leurs propres abonnements, les admins voient tout
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true
      if (req.user) {
        return {
          user: {
            equals: req.user.id,
          },
        }
      }
      return false
    },
    // Seuls les admins peuvent créer/modifier/supprimer
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Utilisateur',
      hasMany: false,
    },
    {
      name: 'plan',
      type: 'relationship',
      relationTo: 'plans',
      required: true,
      label: 'Forfait',
      hasMany: false,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      label: 'Statut',
      defaultValue: 'active',
      options: [
        {
          label: 'Actif',
          value: 'active',
        },
        {
          label: 'Essai gratuit',
          value: 'trialing',
        },
        {
          label: 'Suspendu',
          value: 'suspended',
        },
        {
          label: 'Annulé',
          value: 'canceled',
        },
        {
          label: 'Expiré',
          value: 'expired',
        },
      ],
    },
    {
      name: 'currentPeriodStart',
      type: 'date',
      required: true,
      label: 'Début de la période',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'currentPeriodEnd',
      type: 'date',
      required: true,
      label: 'Fin de la période',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'trialEnd',
      type: 'date',
      label: 'Fin de l\'essai gratuit',
      admin: {
        condition: (data) => data.status === 'trialing',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'canceledAt',
      type: 'date',
      label: 'Date d\'annulation',
      admin: {
        condition: (data) => data.status === 'canceled',
        date: {
          pickerAppearance: 'dayAndTime',
        },
        readOnly: true,
      },
    },
    {
      name: 'autoRenew',
      type: 'checkbox',
      label: 'Renouvellement automatique',
      defaultValue: true,
      admin: {
        description: 'L\'abonnement sera automatiquement renouvelé à la fin de la période',
      },
    },
    {
      name: 'paymentMethod',
      type: 'select',
      label: 'Méthode de paiement',
      options: [
        {
          label: 'Carte bancaire',
          value: 'card',
        },
        {
          label: 'PayPal',
          value: 'paypal',
        },
        {
          label: 'Virement bancaire',
          value: 'bank_transfer',
        },
        {
          label: 'Gratuit',
          value: 'free',
        },
        {
          label: 'Essai',
          value: 'trial',
        },
      ],
    },
    {
      name: 'amount',
      type: 'number',
      label: 'Montant payé (€)',
      min: 0,
      admin: {
        description: 'Montant réellement payé pour cette période',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notes administratives',
      admin: {
        description: 'Notes internes sur cet abonnement',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ operation, data, req }) => {
        // Lors de l'annulation, enregistrer la date
        if (data.status === 'canceled' && !data.canceledAt) {
          data.canceledAt = new Date().toISOString()
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        // Mettre à jour le statut de l'utilisateur
        if (operation === 'create' || operation === 'update') {
          try {
            // @ts-ignore - Les types seront régénérés après la migration
            await req.payload.update({
              collection: 'users',
              id: typeof doc.user === 'object' ? doc.user.id : doc.user,
              data: {
                currentSubscription: doc.id,
                subscriptionStatus: doc.status,
              },
            })
          } catch (error) {
            req.payload.logger.error(`Erreur lors de la mise à jour de l'utilisateur: ${error}`)
          }
        }

        return doc
      },
    ],
  },
}
