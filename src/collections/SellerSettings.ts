import type { CollectionConfig } from 'payload'

export const SellerSettings: CollectionConfig = {
  slug: 'seller-settings',
  labels: {
    singular: { en: 'Seller settings', fr: 'Paramètres vendeur' },
    plural: { en: 'Seller settings', fr: 'Paramètres vendeurs' },
  },
  admin: {
    group: 'Ventes',
    useAsTitle: 'seller',
  },
  fields: [
    {
      name: 'seller',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true, // un seul doc de réglages par vendeur
    },
    {
      name: 'auctionDiscount',
      type: 'number',
      label: { en: 'Auction discount (%)', fr: 'Remise enchère (%)' },
      required: true,
      defaultValue: 10,
      min: 0,
      max: 100,
    },
    {
      name: 'auctionDurationDays',
      type: 'number',
      label: { en: 'Auction duration (days)', fr: 'Durée enchère (jours)' },
      required: true,
      defaultValue: 7,
      min: 1,
    },
  ],
  access: {
    read: ({ req }) => {
      const user = req.user
      if (!user) return false
      if (user.role === 'admin') return true
      // un vendeur ne lit que ses réglages
      return {
        seller: { equals: user.id },
      }
    },
    create: ({ req }) => req.user?.role === 'professionnel' || req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'professionnel' || req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
}
