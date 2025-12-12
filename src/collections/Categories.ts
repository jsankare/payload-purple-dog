import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: {
      en: 'Category',
      fr: 'Catégorie',
    },
    plural: {
      en: 'Categories',
      fr: 'Catégories',
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'active'],
  },
  defaultSort: 'name',
  access: {
    // Lecture publique pour les filtres du catalogue
    read: () => true,

    // Seuls les admins peuvent créer/modifier/supprimer
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: {
        en: 'Name',
        fr: 'Nom',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: {
        en: 'Slug',
        fr: 'Identifiant',
      },
      admin: {
        description: {
          en: 'URL-friendly identifier (auto-generated from name if left empty)',
          fr: 'Identifiant pour URL (auto-généré depuis le nom si vide)',
        },
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            // Auto-générer le slug depuis le nom si vide
            if (!value && data?.name) {
              return data.name
                .toLowerCase()
                .normalize('NFD') // Décomposer les caractères accentués
                .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
                .replace(/[^a-z0-9]+/g, '-') // Remplacer les caractères spéciaux par des tirets
                .replace(/(^-|-$)/g, '') // Supprimer les tirets au début et à la fin
            }
            return value
          },
        ],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
      label: {
        en: 'Description',
        fr: 'Description',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      label: {
        en: 'Active category',
        fr: 'Catégorie active',
      },
      admin: {
        description: {
          en: 'Only active categories are visible in filters',
          fr: 'Seules les catégories actives sont visibles dans les filtres',
        },
      },
    },
  ],
}
