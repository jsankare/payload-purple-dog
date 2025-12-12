import type { CollectionConfig } from 'payload'
import { ObjectsRowLabel } from '../components/ObjectsRowLabel'

export const Objects: CollectionConfig = {
  slug: 'objects',
  admin: {
    useAsTitle: 'name',
  },
  labels: {
    singular: { en: 'Object', fr: 'Objet' },
    plural: { en: 'Objects', fr: 'Objets' },
  },
  fields: [
    // Name
    {
      name: 'name',
      type: 'text',
      label: { en: 'Name of the object', fr: 'Nom de l\'objet' },
      required: true,
    },

    // Category
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      label: { en: 'Category', fr: 'Catégorie' },
      admin: {
        description: {
          en: 'Category of the object',
          fr: 'Catégorie de l\'objet',
        },
      },
    },

    // Dimensions
    {
      name: 'dimensions',
      type: 'group',
      label: { en: 'Dimensions and Weight', fr: 'Dimensions et Poids' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'height',
              type: 'number',
              label: { en: 'Height (cm)', fr: 'Hauteur (cm)' },
              required: true,
            },
            {
              name: 'width',
              type: 'number',
              label: { en: 'Width (cm)', fr: 'Largeur (cm)' },
              required: true,
            },
            {
              name: 'depth',
              type: 'number',
              label: { en: 'Depth (cm)', fr: 'Profondeur (cm)' },
              required: true,
            },
            {
              name: 'weight',
              type: 'number',
              label: { en: 'Weight (kg)', fr: 'Poids (kg)' },
              required: true,
            },
          ],
        },
      ],
      required: true,
    },

    // Description
    {
      name: 'description',
      type: 'textarea',
      label: { en: 'Description', fr: 'Description' },
      required: true,
    },

    // Documents
    {
      name: 'documents',
      type: 'array',
      label: { en: 'Documents', fr: 'Documents' },
      admin: {
        /* components: {
          RowLabel: ObjectsRowLabel,
        }, */
      },
      // required: true, // Optional for now
      fields: [
        {
          name: 'name',
          type: 'text',
          label: { en: 'Name', fr: 'Nom' },
          required: true,
        },
        {
          name: 'file',
          type: 'upload',
          label: { en: 'File', fr: 'Fichier' },
          relationTo: 'media',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: { en: 'Description', fr: 'Description' },
        },
      ],
    },

    // Photos
    {
      name: 'photos',
      type: 'array',
      label: { en: 'Photos', fr: 'Photos' },
      minRows: 1,
      required: true,
      labels: {
        singular: { en: 'Photo', fr: 'Photo' },
        plural: { en: 'Photos', fr: 'Photos' },
      },
      admin: {
        /* components: {
          RowLabel: ObjectsRowLabel,
        }, */
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          label: { en: 'Name', fr: 'Nom' },
          required: true,
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: { en: 'Image', fr: 'Image' },
        },
      ],
    },

    // Seller
    {
      name: 'seller',
      type: 'relationship',
      label: { en: 'Seller', fr: 'Vendeur' },
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },

    // Sale mode
    {
      name: 'saleMode',
      type: 'select',
      label: { en: 'Sale mode', fr: 'Mode de vente' },
      required: true,
      defaultValue: 'quick_sale',
      options: [
        { label: { en: 'Quick sale', fr: 'Vente rapide' }, value: 'quick_sale' },
        { label: { en: 'Auction', fr: 'Enchère' }, value: 'auction' },
      ],
    },

    // Champs spécifiques Vente rapide
    {
      name: 'quickSalePrice',
      type: 'number',
      label: { en: 'Quick sale price', fr: 'Prix vente rapide' },
      required: true,
      admin: {
        condition: (_, siblingData) => siblingData?.saleMode === 'quick_sale',
      },
    },

    // Champs spécifiques Enchère
    {
      name: 'auctionStartPrice',
      type: 'number',
      label: { en: 'Starting bid', fr: 'Mise à prix' },
      required: true,
      admin: {
        condition: (_, siblingData) => siblingData?.saleMode === 'auction',
      },
    },
    {
      name: 'auctionEndDate',
      type: 'date',
      label: { en: 'Auction end', fr: 'Fin de l\'enchère' },
      required: true,
      admin: {
        condition: (_, siblingData) => siblingData?.saleMode === 'auction',
      },
    },

    // Status of the object
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      label: { en: 'Status', fr: 'Statut' },
      options: [
        { label: { en: 'Draft', fr: 'Brouillon' }, value: 'draft' },
        { label: { en: 'Active', fr: 'En vente' }, value: 'active' },
        { label: { en: 'Sold', fr: 'Vendu' }, value: 'sold' },
        { label: { en: 'Expired', fr: 'Expiré' }, value: 'expired' },
        { label: { en: 'Removed', fr: 'Retiré' }, value: 'removed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },

    // Reserve price (auctions only)
    {
      name: 'reservePrice',
      type: 'number',
      label: { en: 'Reserve price', fr: 'Prix de réserve' },
      admin: {
        condition: (_, siblingData) => siblingData?.saleMode === 'auction',
        description: {
          en: 'Minimum price required for the object to be sold',
          fr: 'Prix minimum pour que l\'objet soit vendu',
        },
      },
    },

    // Current auction state
    {
      name: 'currentBidAmount',
      type: 'number',
      label: { en: 'Current bid amount', fr: 'Enchère actuelle' },
      admin: {
        readOnly: true,
        condition: (_, siblingData) => siblingData?.saleMode === 'auction',
      },
    },
    {
      name: 'currentBidder',
      type: 'relationship',
      relationTo: 'users',
      label: { en: 'Current highest bidder', fr: 'Enchérisseur actuel' },
      admin: {
        readOnly: true,
        condition: (_, siblingData) => siblingData?.saleMode === 'auction',
      },
    },
    {
      name: 'bidCount',
      type: 'number',
      defaultValue: 0,
      label: { en: 'Number of bids', fr: 'Nombre d\'enchères' },
      admin: {
        readOnly: true,
      },
    },

    // Stats
    {
      name: 'viewCount',
      type: 'number',
      defaultValue: 0,
      label: { en: 'Number of views', fr: 'Nombre de vues' },
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'favoriteCount',
      type: 'number',
      defaultValue: 0,
      label: { en: 'Number of favorites', fr: 'Nombre de favoris' },
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'auctionExtensions',
      type: 'number',
      defaultValue: 0,
      label: { en: 'Auction extensions', fr: 'Prolongations d\'enchère' },
      admin: {
        readOnly: true,
        condition: (_, siblingData) => siblingData?.saleMode === 'auction',
        description: {
          en: 'Number of times the auction end was extended by 10 minutes',
          fr: 'Nombre de fois que l\'enchère a été prolongée de 10 min',
        },
      },
    },

    // Timeline
    {
      name: 'publishedAt',
      type: 'date',
      label: { en: 'Published at', fr: 'Date de publication' },
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'soldAt',
      type: 'date',
      label: { en: 'Sold at', fr: 'Date de vente' },
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],

  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
        if (operation === 'create' && req.user) {
          return {
            ...data,
            seller: req.user.id,
          }
        }
        return data
      },
    ],
  },
}
