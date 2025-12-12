import type { CollectionConfig } from 'payload'

export const Feedback: CollectionConfig = {
  slug: 'feedback',
  labels: {
    singular: 'Avis',
    plural: 'Avis',
  },
  access: {
    // Les utilisateurs authentifiés peuvent créer des avis
    create: ({ req }) => !!req.user,

    // Les admins voient tout, les utilisateurs voient leurs propres avis
    read: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'admin') return true

      return {
        user: {
          equals: req.user.id,
        },
      }
    },

    // Un utilisateur ne peut modifier que ses propres avis
    update: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'admin') return true

      return {
        user: {
          equals: req.user.id,
        },
      }
    },

    // Un utilisateur ne peut supprimer que ses propres avis
    delete: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'admin') return true

      return {
        user: {
          equals: req.user.id,
        },
      }
    },
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'stars', 'npsScore', 'createdAt'],
    group: 'Contenu',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Utilisateur ayant donné l\'avis',
      },
      // Définir automatiquement l'utilisateur connecté
      hooks: {
        beforeValidate: [
          ({ req, value }) => {
            // Si pas de valeur et qu'il y a un utilisateur connecté, utiliser cet utilisateur
            if (!value && req.user) {
              return req.user.id
            }
            return value
          },
        ],
      },
    },
    {
      name: 'stars',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      admin: {
        description: 'Note en étoiles (1 à 5)',
        step: 1,
      },
    },
    {
      name: 'npsScore',
      type: 'number',
      required: true,
      min: 1,
      max: 10,
      admin: {
        description: 'Note NPS (1 à 10)',
        step: 1,
      },
    },
    {
      name: 'comment',
      type: 'textarea',
      admin: {
        description: 'Commentaires et suggestions',
        placeholder: 'Partagez votre expérience et vos suggestions...',
      },
    },
  ],
  timestamps: true,
}
