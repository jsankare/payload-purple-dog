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
      type: 'select',
      label: { en: 'Category', fr: 'Categorie' },
      required: true,
      options: [
        { label: 'Bijoux & montres', value: 'jewelry_watches' },
        { label: 'Meubles anciens', value: 'antique_furniture' },
        { label: 'Objets d’art & tableaux', value: 'art_paintings' },
        { label: 'Objets de collection (jouets, timbres, monnaies...)', value: 'collectibles' },
        { label: 'Vins & spiritueux de collection', value: 'fine_wines' },
        { label: 'Instruments de musique', value: 'instruments' },
        { label: 'Livres anciens & manuscrits', value: 'rare_books' },
        { label: 'Véhicules anciens', value: 'classic_cars' },
        { label: 'Mode & accessoires de luxe (sacs, chaussures, vêtements de marque, etc.)', value: 'luxury_fashion' },
        { label: 'Horlogerie & pendules anciennes', value: 'clocks' },
        { label: 'Photographies anciennes & appareils vintage', value: 'vintage_photo' },
        { label: 'Vaisselle & argenterie & cristallerie', value: 'tableware' },
        { label: 'Sculptures & objets décoratifs', value: 'decorative_art' },
        { label: 'Véhicules de collection (auto, moto, nautisme, etc.)', value: 'vintage_vehicles' },
      ],
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
        components: {
          RowLabel: ObjectsRowLabel as any,
        },
      },
      required: true,
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
      minRows: 10,
      required: true,
      labels: {
        singular: { en: 'Photo', fr: 'Photo' },
        plural: { en: 'Photos', fr: 'Photos' },
      },
      admin: {
        components: {
          RowLabel: ObjectsRowLabel as any,
        },
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

    // (Optionnel) Prix générique si tu veux le garder pour les deux
    // {
    //   name: 'price',
    //   type: 'number',
    //   label: { en: 'Price', fr: 'Prix' },
    //   required: true,
    // },
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
