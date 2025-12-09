// Schémas Swagger pour toutes les collections

export const swaggerSchemas = {
  // ========== Schémas Communs ==========
  Address: {
    type: 'object',
    required: ['street', 'city', 'postalCode', 'country'],
    properties: {
      street: { type: 'string', example: '123 Rue de la Paix' },
      city: { type: 'string', example: 'Paris' },
      postalCode: { type: 'string', example: '75001' },
      country: { type: 'string', example: 'France', default: 'France' },
    },
  },

  Error: {
    type: 'object',
    properties: {
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
    },
  },

  // ========== Schémas Users ==========
  UserParticulier: {
    type: 'object',
    required: ['email', 'password', 'role', 'firstName', 'lastName', 'address', 'isOver18', 'acceptedGDPR'],
    properties: {
      email: { type: 'string', format: 'email', example: 'jean.dupont@example.com' },
      password: { type: 'string', format: 'password', minLength: 8, example: 'Password123!' },
      role: { type: 'string', enum: ['particulier'], example: 'particulier' },
      firstName: { type: 'string', example: 'Jean' },
      lastName: { type: 'string', example: 'Dupont' },
      profilePhoto: { type: 'integer', description: 'ID du média (photo de profil)', nullable: true },
      address: { $ref: '#/components/schemas/Address' },
      age: { type: 'integer', example: 35, nullable: true },
      isOver18: { type: 'boolean', example: true, description: 'Certification +18 ans' },
      acceptedGDPR: { type: 'boolean', example: true, description: 'Acceptation RGPD (obligatoire)' },
      newsletterSubscription: { type: 'boolean', example: false, default: false },
    },
  },

  UserProfessionnel: {
    type: 'object',
    required: ['email', 'password', 'role', 'firstName', 'lastName', 'address', 'companyName', 'siret', 'officialDocument', 'specialties', 'soughtItems', 'acceptedTerms', 'acceptedMandate', 'acceptedGDPR'],
    properties: {
      email: { type: 'string', format: 'email', example: 'contact@entreprise.com' },
      password: { type: 'string', format: 'password', minLength: 8, example: 'Password123!' },
      role: { type: 'string', enum: ['professionnel'], example: 'professionnel' },
      firstName: { type: 'string', example: 'Marie' },
      lastName: { type: 'string', example: 'Martin' },
      companyName: { type: 'string', example: 'Antiquités Durand SARL' },
      siret: { type: 'string', pattern: '^\\d{14}$', example: '12345678901234', description: 'Numéro SIRET (14 chiffres)' },
      officialDocument: { type: 'integer', description: 'ID du K-Bis ou document officiel' },
      address: { $ref: '#/components/schemas/Address' },
      website: { type: 'string', format: 'uri', example: 'https://www.mon-entreprise.fr', nullable: true },
      specialties: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          properties: {
            specialty: { type: 'string', example: 'Antiquités' },
          },
        },
      },
      soughtItems: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          properties: {
            item: { type: 'string', example: 'Meubles anciens' },
          },
        },
      },
      socialMedia: {
        type: 'object',
        properties: {
          facebook: { type: 'string', nullable: true },
          instagram: { type: 'string', nullable: true },
          linkedin: { type: 'string', nullable: true },
          twitter: { type: 'string', nullable: true },
        },
      },
      acceptedTerms: { type: 'boolean', example: true, description: 'Acceptation CGV' },
      acceptedMandate: { type: 'boolean', example: true, description: 'Acceptation mandat d\'apport d\'affaire' },
      acceptedGDPR: { type: 'boolean', example: true, description: 'Acceptation RGPD' },
      newsletterSubscription: { type: 'boolean', example: false, default: false },
    },
  },

  UserResponse: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      email: { type: 'string' },
      role: { type: 'string', enum: ['particulier', 'professionnel', 'admin'] },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      accountStatus: { type: 'string', enum: ['pending', 'active', 'suspended', 'rejected'] },
      emailVerified: { type: 'boolean' },
      currentSubscription: { type: 'integer', nullable: true },
      subscriptionStatus: { type: 'string', enum: ['active', 'trialing', 'suspended', 'canceled', 'expired'], nullable: true },
    },
  },

  LoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email', example: 'user@example.com' },
      password: { type: 'string', format: 'password', example: 'Password123!' },
    },
  },

  LoginResponse: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Authentication Passed' },
      token: { type: 'string', description: 'JWT Token' },
      exp: { type: 'integer', description: 'Token expiration timestamp' },
      user: { $ref: '#/components/schemas/UserResponse' },
    },
  },

  // ========== Schémas Plans (Forfaits) ==========
  PlanFeature: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      feature: { type: 'string', example: 'Accès illimité à la plateforme' },
    },
  },

  Plan: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      name: { type: 'string', example: 'Forfait Professionnel' },
      slug: { type: 'string', example: 'professionnel' },
      userType: { type: 'string', enum: ['particulier', 'professionnel'], example: 'professionnel' },
      price: { type: 'number', example: 49, description: 'Prix mensuel en euros' },
      trialPeriodDays: { type: 'integer', example: 30, description: 'Période d\'essai en jours' },
      description: { type: 'string', example: '1 mois gratuit puis 49€/mois. Accès illimité pour les professionnels.' },
      features: {
        type: 'array',
        items: { $ref: '#/components/schemas/PlanFeature' },
      },
      isActive: { type: 'boolean', example: true },
      isDefault: { type: 'boolean', example: true },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },

  CreatePlanRequest: {
    type: 'object',
    required: ['name', 'slug', 'userType', 'price'],
    properties: {
      name: { type: 'string', example: 'Forfait Premium' },
      slug: { type: 'string', example: 'premium' },
      userType: { type: 'string', enum: ['particulier', 'professionnel'], example: 'professionnel' },
      price: { type: 'number', example: 99 },
      trialPeriodDays: { type: 'integer', example: 0 },
      description: { type: 'string', example: 'Forfait premium avec toutes les fonctionnalités' },
      features: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            feature: { type: 'string' },
          },
        },
      },
      isActive: { type: 'boolean', example: true },
      isDefault: { type: 'boolean', example: false },
    },
  },

  PlansListResponse: {
    type: 'object',
    properties: {
      docs: {
        type: 'array',
        items: { $ref: '#/components/schemas/Plan' },
      },
      totalDocs: { type: 'integer' },
      limit: { type: 'integer' },
      totalPages: { type: 'integer' },
      page: { type: 'integer' },
      pagingCounter: { type: 'integer' },
      hasPrevPage: { type: 'boolean' },
      hasNextPage: { type: 'boolean' },
    },
  },

  // ========== Schémas Subscriptions (Abonnements) ==========
  Subscription: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      user: { type: 'integer', description: 'ID de l\'utilisateur' },
      plan: { type: 'integer', description: 'ID du forfait' },
      status: { type: 'string', enum: ['active', 'trialing', 'suspended', 'canceled', 'expired'], example: 'trialing' },
      currentPeriodStart: { type: 'string', format: 'date-time' },
      currentPeriodEnd: { type: 'string', format: 'date-time' },
      trialEnd: { type: 'string', format: 'date-time', nullable: true },
      canceledAt: { type: 'string', format: 'date-time', nullable: true },
      autoRenew: { type: 'boolean', example: true },
      paymentMethod: { type: 'string', enum: ['card', 'paypal', 'bank_transfer', 'free'], example: 'free' },
      amount: { type: 'number', example: 0, description: 'Montant payé en euros' },
      notes: { type: 'string', nullable: true },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },

  CreateSubscriptionRequest: {
    type: 'object',
    required: ['user', 'plan', 'status', 'currentPeriodStart', 'currentPeriodEnd'],
    properties: {
      user: { type: 'integer', example: 1 },
      plan: { type: 'integer', example: 2 },
      status: { type: 'string', enum: ['active', 'trialing', 'suspended', 'canceled', 'expired'], example: 'trialing' },
      currentPeriodStart: { type: 'string', format: 'date-time', example: '2025-01-01T00:00:00Z' },
      currentPeriodEnd: { type: 'string', format: 'date-time', example: '2025-02-01T00:00:00Z' },
      trialEnd: { type: 'string', format: 'date-time', example: '2025-02-01T00:00:00Z', nullable: true },
      autoRenew: { type: 'boolean', example: true },
      paymentMethod: { type: 'string', enum: ['card', 'paypal', 'bank_transfer', 'free'], example: 'free' },
      amount: { type: 'number', example: 0 },
      notes: { type: 'string', nullable: true },
    },
  },

  SubscriptionsListResponse: {
    type: 'object',
    properties: {
      docs: {
        type: 'array',
        items: { $ref: '#/components/schemas/Subscription' },
      },
      totalDocs: { type: 'integer' },
      limit: { type: 'integer' },
      totalPages: { type: 'integer' },
      page: { type: 'integer' },
    },
  },

  // ========== Schémas Init Plans ==========
  InitPlansResponse: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Forfaits initialisés avec succès' },
      plans: {
        type: 'object',
        properties: {
          particulier: { $ref: '#/components/schemas/Plan' },
          professionnel: { $ref: '#/components/schemas/Plan' },
        },
      },
    },
  },
}
