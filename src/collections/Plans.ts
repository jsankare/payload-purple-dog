import type { CollectionConfig } from 'payload'

export const Plans: CollectionConfig = {
  slug: 'plans',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'userType', 'price', 'isActive'],
    description: 'Gestion des forfaits d\'abonnement pour la plateforme',
  },
  access: {
    // Tous peuvent lire les forfaits
    read: () => true,
    // Seuls les admins peuvent créer/modifier/supprimer
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nom du forfait',
      admin: {
        description: 'Nom affiché du forfait (ex: "Forfait Particulier", "Forfait Professionnel")',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Identifiant unique',
      admin: {
        description: 'Identifiant technique unique (ex: "particulier", "professionnel")',
      },
    },
    {
      name: 'userType',
      type: 'select',
      required: true,
      label: 'Type d\'utilisateur',
      options: [
        {
          label: 'Particulier',
          value: 'particulier',
        },
        {
          label: 'Professionnel',
          value: 'professionnel',
        },
      ],
      admin: {
        description: 'À quel type d\'utilisateur s\'applique ce forfait',
      },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      label: 'Prix mensuel (€)',
      defaultValue: 0,
      min: 0,
      admin: {
        description: 'Prix en euros par mois. Mettre 0 pour gratuit.',
      },
    },
    {
      name: 'trialPeriodDays',
      type: 'number',
      label: 'Période d\'essai (jours)',
      defaultValue: 0,
      min: 0,
      admin: {
        description: 'Nombre de jours d\'essai gratuit. Mettre 0 pour aucune période d\'essai.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'Description complète du forfait et de ses avantages',
      },
    },
    {
      name: 'features',
      type: 'array',
      label: 'Fonctionnalités incluses',
      fields: [
        {
          name: 'feature',
          type: 'text',
          required: true,
          label: 'Fonctionnalité',
        },
      ],
      admin: {
        description: 'Liste des fonctionnalités incluses dans ce forfait',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Forfait actif',
      defaultValue: true,
      admin: {
        description: 'Désactiver pour masquer ce forfait (sans le supprimer)',
      },
    },
    {
      name: 'isDefault',
      type: 'checkbox',
      label: 'Forfait par défaut',
      defaultValue: false,
      admin: {
        description: 'Forfait attribué automatiquement lors de l\'inscription',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        // Générer automatiquement le slug à partir du nom si non fourni
        if (operation === 'create' && !data?.slug && data?.name) {
          data.slug = data.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }
        return data
      },
    ],
  },
}
