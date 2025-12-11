import type { CollectionConfig } from 'payload'

export const Settings: CollectionConfig = {
  slug: 'settings',
  admin: {
    useAsTitle: 'label',
    description: 'Paramètres globaux de la plateforme',
    group: 'Administration',
  },
  access: {
    read: ({ req: { user } }) => user?.role === 'admin',
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: () => false,
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      label: 'Libellé',
      admin: {
        description: 'Nom du paramètre (ex: "Commissions Plateforme")',
      },
    },
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      label: 'Clé unique',
      admin: {
        description: 'Identifiant technique (ex: "platform_commissions")',
      },
    },
    
    {
      name: 'globalCommissions',
      type: 'group',
      label: 'Commissions Globales',
      admin: {
        condition: (data) => data.key === 'platform_commissions',
      },
      fields: [
        {
          name: 'buyerCommission',
          type: 'number',
          required: true,
          label: 'Commission Acheteur (%)',
          defaultValue: 5,
          min: 0,
          max: 100,
          admin: {
            description: 'Pourcentage de commission prélevé sur l\'acheteur',
            step: 0.1,
          },
        },
        {
          name: 'sellerCommission',
          type: 'number',
          required: true,
          label: 'Commission Vendeur (%)',
          defaultValue: 10,
          min: 0,
          max: 100,
          admin: {
            description: 'Pourcentage de commission prélevé sur le vendeur',
            step: 0.1,
          },
        },
      ],
    },

    {
      name: 'categoryCommissions',
      type: 'array',
      label: 'Commissions par Catégorie',
      admin: {
        condition: (data) => data.key === 'category_commissions',
        description: 'Définir des commissions spécifiques par catégorie',
      },
      fields: [
        {
          name: 'category',
          type: 'relationship',
          relationTo: 'categories',
          required: true,
          label: 'Catégorie',
        },
        {
          name: 'buyerCommission',
          type: 'number',
          required: true,
          label: 'Commission Acheteur (%)',
          defaultValue: 5,
          min: 0,
          max: 100,
          admin: {
            step: 0.1,
          },
        },
        {
          name: 'sellerCommission',
          type: 'number',
          required: true,
          label: 'Commission Vendeur (%)',
          defaultValue: 10,
          min: 0,
          max: 100,
          admin: {
            step: 0.1,
          },
        },
      ],
    },

    {
      name: 'formConfig',
      type: 'group',
      label: 'Configuration Formulaires',
      admin: {
        condition: (data) => data.key === 'object_form_config',
      },
      fields: [
        {
          name: 'requiredFields',
          type: 'array',
          label: 'Champs Obligatoires',
          admin: {
            description: 'Liste des champs obligatoires dans le formulaire de dépôt',
          },
          fields: [
            {
              name: 'fieldName',
              type: 'text',
              required: true,
              label: 'Nom du champ',
            },
          ],
        },
        {
          name: 'minPhotos',
          type: 'number',
          label: 'Nombre minimum de photos',
          defaultValue: 1,
          min: 0,
          max: 20,
        },
        {
          name: 'maxPhotos',
          type: 'number',
          label: 'Nombre maximum de photos',
          defaultValue: 10,
          min: 1,
          max: 50,
        },
        {
          name: 'enableCertificates',
          type: 'checkbox',
          label: 'Activer les certificats d\'authenticité',
          defaultValue: true,
        },
        {
          name: 'enableExpertise',
          type: 'checkbox',
          label: 'Activer les expertises',
          defaultValue: true,
        },
      ],
    },

    {
      name: 'generalSettings',
      type: 'group',
      label: 'Paramètres Généraux',
      fields: [
        {
          name: 'maintenanceMode',
          type: 'checkbox',
          label: 'Mode Maintenance',
          defaultValue: false,
          admin: {
            description: 'Activer le mode maintenance (site inaccessible sauf pour les admins)',
          },
        },
        {
          name: 'registrationEnabled',
          type: 'checkbox',
          label: 'Inscriptions Activées',
          defaultValue: true,
          admin: {
            description: 'Autoriser les nouvelles inscriptions',
          },
        },
        {
          name: 'auctionEnabled',
          type: 'checkbox',
          label: 'Enchères Activées',
          defaultValue: true,
        },
        {
          name: 'quickSaleEnabled',
          type: 'checkbox',
          label: 'Vente Rapide Activée',
          defaultValue: true,
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (operation === 'create' && !data?.key && data?.label) {
          data.key = data.label
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/(^_|_$)/g, '')
        }
        return data
      },
    ],
  },
}
