import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'isActive', 'objectCount'],
    description: 'Gestion des catégories d\'objets',
    group: 'Administration',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nom de la catégorie',
      admin: {
        description: 'Nom affiché de la catégorie (ex: "Art Contemporain")',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug (URL)',
      admin: {
        description: 'Identifiant unique pour l\'URL (ex: "art-contemporain")',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'Description de la catégorie',
      },
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
      label: 'Icône',
      admin: {
        description: 'Icône de la catégorie (recommandé: SVG ou PNG transparent)',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Image de couverture',
      admin: {
        description: 'Image de présentation de la catégorie',
      },
    },
    {
      name: 'parentCategory',
      type: 'relationship',
      relationTo: 'categories',
      label: 'Catégorie Parente',
      admin: {
        description: 'Pour créer une hiérarchie de catégories (sous-catégories)',
      },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Ordre d\'affichage',
      defaultValue: 0,
      admin: {
        description: 'Ordre d\'affichage (0 = premier)',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Catégorie Active',
      defaultValue: true,
      admin: {
        description: 'Désactiver pour masquer la catégorie sans la supprimer',
      },
    },
    {
      name: 'featuredOnHome',
      type: 'checkbox',
      label: 'Afficher sur la page d\'accueil',
      defaultValue: false,
      admin: {
        description: 'Mettre en avant cette catégorie sur la page d\'accueil',
      },
    },

    {
      name: 'customCommissions',
      type: 'group',
      label: 'Commissions Spécifiques',
      admin: {
        description: 'Définir des commissions particulières pour cette catégorie (sinon, commissions globales)',
      },
      fields: [
        {
          name: 'useCustomCommissions',
          type: 'checkbox',
          label: 'Utiliser des commissions personnalisées',
          defaultValue: false,
        },
        {
          name: 'buyerCommission',
          type: 'number',
          label: 'Commission Acheteur (%)',
          min: 0,
          max: 100,
          admin: {
            condition: (data, siblingData) => siblingData?.useCustomCommissions,
            step: 0.1,
          },
        },
        {
          name: 'sellerCommission',
          type: 'number',
          label: 'Commission Vendeur (%)',
          min: 0,
          max: 100,
          admin: {
            condition: (data, siblingData) => siblingData?.useCustomCommissions,
            step: 0.1,
          },
        },
      ],
    },

    {
      name: 'formCustomization',
      type: 'group',
      label: 'Personnalisation du Formulaire',
      admin: {
        description: 'Champs spécifiques à demander pour cette catégorie',
      },
      fields: [
        {
          name: 'additionalFields',
          type: 'array',
          label: 'Champs Supplémentaires',
          admin: {
            description: 'Ajouter des champs spécifiques pour cette catégorie',
          },
          fields: [
            {
              name: 'fieldName',
              type: 'text',
              required: true,
              label: 'Nom du champ',
            },
            {
              name: 'fieldLabel',
              type: 'text',
              required: true,
              label: 'Libellé',
            },
            {
              name: 'fieldType',
              type: 'select',
              required: true,
              label: 'Type de champ',
              options: [
                { label: 'Texte', value: 'text' },
                { label: 'Nombre', value: 'number' },
                { label: 'Date', value: 'date' },
                { label: 'Oui/Non', value: 'checkbox' },
                { label: 'Sélection', value: 'select' },
              ],
            },
            {
              name: 'isRequired',
              type: 'checkbox',
              label: 'Obligatoire',
              defaultValue: false,
            },
          ],
        },
        {
          name: 'requireCertificate',
          type: 'checkbox',
          label: 'Certificat d\'authenticité obligatoire',
          defaultValue: false,
        },
        {
          name: 'requireExpertise',
          type: 'checkbox',
          label: 'Expertise obligatoire',
          defaultValue: false,
        },
      ],
    },

    {
      name: 'objectCount',
      type: 'number',
      label: 'Nombre d\'objets',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Nombre total d\'objets dans cette catégorie',
      },
    },
    {
      name: 'activeAuctionsCount',
      type: 'number',
      label: 'Enchères actives',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Nombre d\'enchères en cours dans cette catégorie',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
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
    afterChange: [
      async ({ doc, operation, req }) => {
        // Mettre à jour les compteurs
        if (operation === 'create' || operation === 'update') {
          // Compter les objets dans cette catégorie
          try {
            const objectsCount = await req.payload.count({
              collection: 'objects',
              where: {
                category: {
                  equals: doc.id,
                },
              },
            })

            const activeAuctions = await req.payload.count({
              collection: 'objects',
              where: {
                and: [
                  {
                    category: {
                      equals: doc.id,
                    },
                  },
                  {
                    saleMode: {
                      equals: 'auction',
                    },
                  },
                  {
                    status: {
                      equals: 'active',
                    },
                  },
                ],
              },
            })

            await req.payload.update({
              collection: 'categories',
              id: doc.id,
              data: {
                objectCount: objectsCount.totalDocs,
                activeAuctionsCount: activeAuctions.totalDocs,
              },
            })
          } catch (error) {
            req.payload.logger.error(`Erreur mise à jour stats catégorie: ${error}`)
          }
        }
        return doc
      },
    ],
  },
}
