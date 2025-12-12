import type { GlobalConfig } from 'payload'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: {
    en: 'Settings',
    fr: 'Paramètres',
  },
  admin: {
    description: 'Paramètres globaux de la plateforme (commissions, etc.)',
  },
  access: {
    // Lecture publique (nécessaire pour calculer les commissions)
    read: () => true,

    // Mise à jour: admin uniquement
    update: ({ req: { user } }) => {
      return user?.role === 'admin'
    },
  },
  fields: [
    {
      name: 'globalBuyerCommission',
      type: 'number',
      required: true,
      defaultValue: 3,
      min: 0,
      max: 100,
      label: {
        en: 'Global buyer commission (%)',
        fr: 'Commission acheteur globale (%)',
      },
      admin: {
        description: {
          en: 'Commission percentage added to the final price for buyers (default: 3%)',
          fr: 'Pourcentage de commission ajouté au prix final pour les acheteurs (défaut: 3%)',
        },
      },
    },
    {
      name: 'globalSellerCommission',
      type: 'number',
      required: true,
      defaultValue: 2,
      min: 0,
      max: 100,
      label: {
        en: 'Global seller commission (%)',
        fr: 'Commission vendeur globale (%)',
      },
      admin: {
        description: {
          en: 'Commission percentage deducted from the final price for sellers (default: 2%)',
          fr: 'Pourcentage de commission déduit du prix final pour les vendeurs (défaut: 2%)',
        },
      },
    },
    {
      name: 'defaultAuctionDuration',
      type: 'number',
      required: true,
      defaultValue: 7,
      min: 1,
      max: 30,
      label: {
        en: 'Default auction duration (days)',
        fr: 'Durée par défaut des enchères (jours)',
      },
      admin: {
        description: {
          en: 'Default duration in days if not specified (default: 7)',
          fr: 'Durée en jours si non spécifiée (défaut: 7)',
        },
      },
    },
  ],
}
