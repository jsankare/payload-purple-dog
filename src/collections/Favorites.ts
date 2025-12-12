import type { CollectionConfig } from 'payload'

export const Favorites: CollectionConfig = {
  slug: 'favorites',
  labels: {
    singular: {
      en: 'Favorite',
      fr: 'Favori',
    },
    plural: {
      en: 'Favorites',
      fr: 'Favoris',
    },
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'object', 'createdAt'],
  },
  defaultSort: '-createdAt',
  access: {
    // Création: utilisateurs authentifiés uniquement
    create: ({ req: { user } }) => {
      return !!user
    },

    // Lecture: admin tout voir, sinon seulement ses propres favoris
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true

      // Utilisateur ne voit que ses favoris
      return {
        user: {
          equals: user.id,
        },
      }
    },

    // Suppression: admin tout supprimer, sinon seulement ses propres favoris
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true

      // Utilisateur ne peut supprimer que ses favoris
      return {
        user: {
          equals: user.id,
        },
      }
    },

    // Mise à jour: désactivée
    update: () => false,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: {
        en: 'User',
        fr: 'Utilisateur',
      },
    },
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
      name: 'createdAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        readOnly: true,
        description: {
          en: 'When the favorite was added',
          fr: 'Quand le favori a été ajouté',
        },
      },
    },
  ],
}
