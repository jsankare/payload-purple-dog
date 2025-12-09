import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'firstName', 'lastName'],
  },
  access: {
    // Permettre la création de compte (inscription) sans authentification
    create: () => true,
    // Seuls les utilisateurs authentifiés peuvent lire
    read: ({ req: { user } }) => {
      // Les admins peuvent tout voir
      if (user?.role === 'admin') return true
      // Les utilisateurs peuvent voir leur propre profil
      if (user) {
        return {
          id: {
            equals: user.id,
          },
        }
      }
      return false
    },
    // Les utilisateurs peuvent mettre à jour leur propre profil
    update: ({ req: { user } }) => {
      if (user) {
        return {
          id: {
            equals: user.id,
          },
        }
      }
      return false
    },
    // Seuls les admins peuvent supprimer
    delete: () => false,
  },
  auth: {
    verify: {
      generateEmailHTML: ({ token, user }) => {
        // URL de validation du compte
        const url = `${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'}/verify?token=${token}`
        
        return `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
            </head>
            <body>
              <h1>Bienvenue ${user.firstName || 'sur notre plateforme'} !</h1>
              <p>Merci de vous être inscrit. Veuillez cliquer sur le lien ci-dessous pour valider votre compte :</p>
              <p><a href="${url}">Valider mon compte</a></p>
              <p>Si vous n'êtes pas à l'origine de cette inscription, veuillez ignorer cet email.</p>
            </body>
          </html>
        `
      },
      generateEmailSubject: () => 'Validez votre compte',
    },
  },
  fields: [
    // Rôle de l'utilisateur
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'particulier',
      options: [
        {
          label: 'Particulier',
          value: 'particulier',
        },
        {
          label: 'Professionnel',
          value: 'professionnel',
        },
        {
          label: 'Admin',
          value: 'admin',
        },
      ],
      admin: {
        position: 'sidebar',
      },
    },

    // ========== CHAMPS COMMUNS ==========
    {
      name: 'firstName',
      type: 'text',
      required: true,
      label: 'Prénom',
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
      label: 'Nom',
    },
    {
      name: 'profilePhoto',
      type: 'upload',
      relationTo: 'media',
      label: 'Photo de profil',
      admin: {
        condition: (data) => data.role === 'particulier',
      },
    },
    {
      name: 'address',
      type: 'group',
      label: 'Adresse postale',
      fields: [
        {
          name: 'street',
          type: 'text',
          label: 'Rue',
          required: true,
        },
        {
          name: 'city',
          type: 'text',
          label: 'Ville',
          required: true,
        },
        {
          name: 'postalCode',
          type: 'text',
          label: 'Code postal',
          required: true,
        },
        {
          name: 'country',
          type: 'text',
          label: 'Pays',
          defaultValue: 'France',
          required: true,
        },
      ],
    },

    // ========== CHAMPS SPÉCIFIQUES PARTICULIER ==========
    {
      name: 'age',
      type: 'number',
      label: 'Âge',
      admin: {
        condition: (data) => data.role === 'particulier',
      },
    },
    {
      name: 'isOver18',
      type: 'checkbox',
      label: 'Je certifie avoir plus de 18 ans',
      admin: {
        condition: (data) => data.role === 'particulier',
      },
      validate: (val: any, { data }: { data: any }) => {
        if (data.role === 'particulier' && !val) {
          return 'Vous devez certifier avoir plus de 18 ans'
        }
        return true
      },
    },

    // ========== CHAMPS SPÉCIFIQUES PROFESSIONNEL ==========
    {
      name: 'companyName',
      type: 'text',
      label: 'Dénomination de l\'entreprise',
      admin: {
        condition: (data) => data.role === 'professionnel',
      },
      validate: (val: any, { data }: { data: any }) => {
        if (data.role === 'professionnel' && !val) {
          return 'La dénomination de l\'entreprise est requise'
        }
        return true
      },
    },
    {
      name: 'siret',
      type: 'text',
      label: 'Numéro SIRET',
      admin: {
        condition: (data) => data.role === 'professionnel',
      },
      validate: (val: any, { data }: { data: any }) => {
        if (data.role === 'professionnel') {
          if (!val) return 'Le numéro SIRET est requis'
          // Validation basique du format SIRET (14 chiffres)
          if (!/^\d{14}$/.test(val.replace(/\s/g, ''))) {
            return 'Le numéro SIRET doit contenir 14 chiffres'
          }
        }
        return true
      },
    },
    {
      name: 'officialDocument',
      type: 'upload',
      relationTo: 'media',
      label: 'Document officiel (K-Bis, avis de situation INSEE, etc.)',
      admin: {
        condition: (data) => data.role === 'professionnel',
        description: 'K-Bis, avis de situation INSEE ou autre document officiel',
      },
      validate: (val: any, { data }: { data: any }) => {
        if (data.role === 'professionnel' && !val) {
          return 'Le document officiel est requis'
        }
        return true
      },
    },
    {
      name: 'website',
      type: 'text',
      label: 'Site internet',
      admin: {
        condition: (data) => data.role === 'professionnel',
      },
      validate: (val: any, { data }: { data: any }) => {
        if (data.role === 'professionnel' && val) {
          // Validation basique d'URL
          try {
            new URL(val)
            return true
          } catch {
            return 'Veuillez entrer une URL valide (ex: https://example.com)'
          }
        }
        return true
      },
    },
    {
      name: 'socialMedia',
      type: 'group',
      label: 'Réseaux sociaux',
      admin: {
        condition: (data) => data.role === 'professionnel',
      },
      fields: [
        {
          name: 'facebook',
          type: 'text',
          label: 'Facebook',
        },
        {
          name: 'instagram',
          type: 'text',
          label: 'Instagram',
        },
        {
          name: 'linkedin',
          type: 'text',
          label: 'LinkedIn',
        },
        {
          name: 'twitter',
          type: 'text',
          label: 'Twitter/X',
        },
      ],
    },

    // ========== CONSENTEMENTS ET RGPD ==========
    {
      name: 'acceptedTerms',
      type: 'checkbox',
      label: 'J\'accepte les CGV',
      admin: {
        condition: (data) => data.role === 'professionnel',
      },
      validate: (val: any, { data }: { data: any }) => {
        if (data.role === 'professionnel' && !val) {
          return 'Vous devez accepter les CGV'
        }
        return true
      },
    },
    {
      name: 'acceptedMandate',
      type: 'checkbox',
      label: 'J\'accepte le mandat d\'apport d\'affaire',
      admin: {
        condition: (data) => data.role === 'professionnel',
      },
      validate: (val: any, { data }: { data: any }) => {
        if (data.role === 'professionnel' && !val) {
          return 'Vous devez accepter le mandat d\'apport d\'affaire'
        }
        return true
      },
    },
    {
      name: 'acceptedGDPR',
      type: 'checkbox',
      label: 'J\'accepte la politique de confidentialité (RGPD)',
      validate: (val: any) => {
        if (!val) {
          return 'Vous devez accepter la politique de confidentialité'
        }
        return true
      },
    },
    {
      name: 'newsletterSubscription',
      type: 'checkbox',
      label: 'Je souhaite m\'inscrire à la newsletter',
      defaultValue: false,
    },

    // ========== CHAMPS SYSTÈME ==========
    {
      name: 'emailVerified',
      type: 'checkbox',
      label: 'Email vérifié',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'accountStatus',
      type: 'select',
      label: 'Statut du compte',
      defaultValue: 'pending',
      options: [
        {
          label: 'En attente de validation',
          value: 'pending',
        },
        {
          label: 'Actif',
          value: 'active',
        },
        {
          label: 'Suspendu',
          value: 'suspended',
        },
        {
          label: 'Rejeté',
          value: 'rejected',
        },
      ],
      admin: {
        position: 'sidebar',
      },
    },

    // ========== ABONNEMENT ==========
    {
      name: 'currentSubscription',
      type: 'relationship',
      relationTo: 'subscriptions',
      label: 'Abonnement actuel',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'subscriptionStatus',
      type: 'select',
      label: 'Statut de l\'abonnement',
      options: [
        {
          label: 'Actif',
          value: 'active',
        },
        {
          label: 'Essai gratuit',
          value: 'trialing',
        },
        {
          label: 'Suspendu',
          value: 'suspended',
        },
        {
          label: 'Annulé',
          value: 'canceled',
        },
        {
          label: 'Expiré',
          value: 'expired',
        },
        {
          label: 'Restreint',
          value: 'restricted',
        },
      ],
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },

    // ========== STRIPE ==========
    {
      name: 'stripeCustomerId',
      type: 'text',
      label: 'Stripe Customer ID',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'stripeSubscriptionId',
      type: 'text',
      label: 'Stripe Subscription ID',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        // Lors de la création d'un compte
        if (operation === 'create') {
          // Envoyer l'email de vérification
          if (!doc._verified) {
            req.payload.logger.info(`Email de vérification envoyé à ${doc.email}`)
          }

          // Si c'est un professionnel, créer un customer Stripe
          if (doc.role === 'professionnel') {
            // Utiliser setTimeout pour créer le customer après commit de la transaction
            setTimeout(async () => {
              try {
                // Importer le helper Stripe dynamiquement
                const { createStripeCustomer } = await import('../lib/stripe')

                // Créer le customer Stripe
                const customer = await createStripeCustomer(
                  doc.email,
                  `${doc.firstName} ${doc.lastName}`,
                  doc.id
                )

                // Mettre à jour l'utilisateur avec le customer Stripe
                await req.payload.update({
                  collection: 'users',
                  id: doc.id,
                  data: {
                    stripeCustomerId: customer.id,
                  },
                })

                req.payload.logger.info(
                  `Customer Stripe créé pour ${doc.email}: ${customer.id}`
                )
              } catch (error) {
                req.payload.logger.error(
                  `Erreur lors de la création du customer Stripe : ${error}`
                )
              }
            }, 1000) // Attendre 1 seconde pour que la transaction soit commitée
          }

          // Si c'est un particulier, créer un abonnement gratuit
          if (doc.role === 'particulier') {
            try {
              // Trouver le forfait particulier
              const particulierPlan = await req.payload.find({
                collection: 'plans',
                where: {
                  slug: {
                    equals: 'particulier',
                  },
                },
                limit: 1,
              })

              if (particulierPlan.docs.length > 0) {
                const plan = particulierPlan.docs[0]
                
                // Créer l'abonnement gratuit permanent
                const now = new Date()
                const periodEnd = new Date(now)
                periodEnd.setFullYear(periodEnd.getFullYear() + 100) // Permanent

                const subscription = await req.payload.create({
                  collection: 'subscriptions',
                  data: {
                    user: doc.id,
                    plan: plan.id,
                    status: 'active',
                    currentPeriodStart: now.toISOString(),
                    currentPeriodEnd: periodEnd.toISOString(),
                    autoRenew: false,
                    paymentMethod: 'free',
                    amount: 0,
                    notes: 'Forfait gratuit particulier - illimité',
                  },
                })

                // Mettre à jour l'utilisateur
                await req.payload.update({
                  collection: 'users',
                  id: doc.id,
                  data: {
                    currentSubscription: subscription.id,
                    subscriptionStatus: 'active',
                  },
                })

                req.payload.logger.info(
                  `Abonnement gratuit créé pour le particulier ${doc.email}`
                )
              }
            } catch (error) {
              req.payload.logger.error(
                `Erreur lors de la création de l'abonnement particulier : ${error}`
              )
            }
          }
        }
        
        return doc
      },
    ],
  },
}
