import type { CollectionConfig } from 'payload'

export const Objects: CollectionConfig = {
  slug: 'objects',
  admin: {
    useAsTitle: 'name',
    // group: 'Objects',
  },
  labels: {
    singular: { en: 'Object', fr: 'Objet' },
    plural: { en: 'Objects', fr: 'Objets' },

  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: { en: 'Name of the object', fr: 'Nom de l\'objet' },
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      label: { en: 'Category', fr: 'Categorie' },
      required: true,
      options: [
        { label: 'Bijoux & montres', value: 'jewelry-watches' },
        { label: 'Meubles anciens', value: 'antique-furniture' },
        { label: 'Objets d’art & tableaux', value: 'art-paintings' },
        { label: 'Objets de collection (jouets, timbres, monnaies...)', value: 'collectibles' },
        { label: 'Vins & spiritueux de collection', value: 'fine-wines' },
        { label: 'Instruments de musique', value: 'instruments' },
        { label: 'Livres anciens & manuscrits', value: 'rare-books' },
        { label: 'Véhicules anciens', value: 'classic-cars' },
        { label: 'Mode & accessoires de luxe (sacs, chaussures, vêtements de marque, etc.)', value: 'luxury-fashion' },
        { label: 'Horlogerie & pendules anciennes', value: 'clocks' },
        { label: 'Photographies anciennes & appareils vintage', value: 'vintage-photo' },
        { label: 'Vaisselle & argenterie & cristallerie', value: 'tableware' },
        { label: 'Sculptures & objets décoratifs', value: 'decorative-art' },
        { label: 'Véhicules de collection (auto, moto, nautisme, etc.)', value: 'vintage-vehicles' },
      ],
    },
    {
      name: 'dimensions',
      type: 'group',
      fields: [
        {
          name: 'height',
          type: 'number',
          label: { en: 'Height', fr: 'Hauteur' },
        },
        {
          name: 'width',
          type: 'number',
          label: { en: 'Width', fr: 'Largeur' },
        },
        {
          name: 'depth',
          type: 'number',
          label: { en: 'Depth', fr: 'Profondeur' },
        },
      ],
      required: true,
    },
    {
      name: 'weight',
      type: 'number',
      label: { en: 'Weight', fr: 'Poids' },
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: { en: 'Description', fr: 'Description' },
      required: true,
    },
    {
      name: 'documents',
      type: 'group',
      fields: [
        {
          name: 'documents',
          type: 'upload',
          label: { en: 'Documents', fr: 'Documents' },
          relationTo: 'media',
          required: true,
        },
      ],
    }
  ],
}