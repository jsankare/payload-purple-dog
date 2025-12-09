// Routes Swagger pour Plans, Subscriptions et Init-Plans

export const swaggerPaths = {
  // ========== Routes Plans ==========
  '/api/plans': {
    get: {
      tags: ['Plans'],
      summary: 'Liste des forfaits',
      description: 'Récupérer la liste de tous les forfaits disponibles (accès public)',
      parameters: [
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', default: 10 },
          description: 'Nombre de résultats par page',
        },
        {
          name: 'page',
          in: 'query',
          schema: { type: 'integer', default: 1 },
          description: 'Numéro de page',
        },
        {
          name: 'where[isActive][equals]',
          in: 'query',
          schema: { type: 'boolean' },
          description: 'Filtrer par statut actif',
        },
        {
          name: 'where[userType][equals]',
          in: 'query',
          schema: { type: 'string', enum: ['particulier', 'professionnel'] },
          description: 'Filtrer par type d\'utilisateur',
        },
      ],
      responses: {
        '200': {
          description: 'Liste des forfaits',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PlansListResponse' },
            },
          },
        },
      },
    },
    post: {
      tags: ['Plans'],
      summary: 'Créer un forfait',
      description: '**Admin uniquement** - Créer un nouveau forfait d\'abonnement',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreatePlanRequest' },
          },
        },
      },
      responses: {
        '201': {
          description: 'Forfait créé avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  doc: { $ref: '#/components/schemas/Plan' },
                  message: { type: 'string', example: 'Plan successfully created.' },
                },
              },
            },
          },
        },
        '401': {
          description: 'Non authentifié',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        '403': {
          description: 'Permission refusée (admin uniquement)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },

  '/api/plans/{id}': {
    get: {
      tags: ['Plans'],
      summary: 'Détails d\'un forfait',
      description: 'Récupérer les détails d\'un forfait spécifique',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
          description: 'ID du forfait',
        },
      ],
      responses: {
        '200': {
          description: 'Détails du forfait',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Plan' },
            },
          },
        },
        '404': {
          description: 'Forfait non trouvé',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
    patch: {
      tags: ['Plans'],
      summary: 'Modifier un forfait',
      description: '**Admin uniquement** - Mettre à jour un forfait existant',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
          description: 'ID du forfait',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreatePlanRequest' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Forfait modifié avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  doc: { $ref: '#/components/schemas/Plan' },
                  message: { type: 'string', example: 'Plan successfully updated.' },
                },
              },
            },
          },
        },
        '401': {
          description: 'Non authentifié',
        },
        '403': {
          description: 'Permission refusée (admin uniquement)',
        },
        '404': {
          description: 'Forfait non trouvé',
        },
      },
    },
    delete: {
      tags: ['Plans'],
      summary: 'Supprimer un forfait',
      description: '**Admin uniquement** - Supprimer un forfait',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
          description: 'ID du forfait',
        },
      ],
      responses: {
        '200': {
          description: 'Forfait supprimé avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Plan successfully deleted.' },
                },
              },
            },
          },
        },
        '401': {
          description: 'Non authentifié',
        },
        '403': {
          description: 'Permission refusée (admin uniquement)',
        },
        '404': {
          description: 'Forfait non trouvé',
        },
      },
    },
  },

  // ========== Routes Subscriptions ==========
  '/api/subscriptions': {
    get: {
      tags: ['Subscriptions'],
      summary: 'Liste des abonnements',
      description: 'Récupérer la liste des abonnements (utilisateur: ses propres abonnements, admin: tous)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', default: 10 },
        },
        {
          name: 'page',
          in: 'query',
          schema: { type: 'integer', default: 1 },
        },
        {
          name: 'where[status][equals]',
          in: 'query',
          schema: { type: 'string', enum: ['active', 'trialing', 'suspended', 'canceled', 'expired'] },
          description: 'Filtrer par statut',
        },
        {
          name: 'where[user][equals]',
          in: 'query',
          schema: { type: 'integer' },
          description: 'Filtrer par ID utilisateur',
        },
      ],
      responses: {
        '200': {
          description: 'Liste des abonnements',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SubscriptionsListResponse' },
            },
          },
        },
        '401': {
          description: 'Non authentifié',
        },
      },
    },
    post: {
      tags: ['Subscriptions'],
      summary: 'Créer un abonnement',
      description: '**Admin uniquement** - Créer un nouvel abonnement pour un utilisateur',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateSubscriptionRequest' },
          },
        },
      },
      responses: {
        '201': {
          description: 'Abonnement créé avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  doc: { $ref: '#/components/schemas/Subscription' },
                  message: { type: 'string', example: 'Subscription successfully created.' },
                },
              },
            },
          },
        },
        '401': {
          description: 'Non authentifié',
        },
        '403': {
          description: 'Permission refusée (admin uniquement)',
        },
      },
    },
  },

  '/api/subscriptions/{id}': {
    get: {
      tags: ['Subscriptions'],
      summary: 'Détails d\'un abonnement',
      description: 'Récupérer les détails d\'un abonnement spécifique',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
          description: 'ID de l\'abonnement',
        },
      ],
      responses: {
        '200': {
          description: 'Détails de l\'abonnement',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Subscription' },
            },
          },
        },
        '401': {
          description: 'Non authentifié',
        },
        '403': {
          description: 'Accès refusé',
        },
        '404': {
          description: 'Abonnement non trouvé',
        },
      },
    },
    patch: {
      tags: ['Subscriptions'],
      summary: 'Modifier un abonnement',
      description: '**Admin uniquement** - Mettre à jour un abonnement existant',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
          description: 'ID de l\'abonnement',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateSubscriptionRequest' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Abonnement modifié avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  doc: { $ref: '#/components/schemas/Subscription' },
                  message: { type: 'string', example: 'Subscription successfully updated.' },
                },
              },
            },
          },
        },
        '401': {
          description: 'Non authentifié',
        },
        '403': {
          description: 'Permission refusée (admin uniquement)',
        },
        '404': {
          description: 'Abonnement non trouvé',
        },
      },
    },
    delete: {
      tags: ['Subscriptions'],
      summary: 'Supprimer un abonnement',
      description: '**Admin uniquement** - Supprimer un abonnement',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
          description: 'ID de l\'abonnement',
        },
      ],
      responses: {
        '200': {
          description: 'Abonnement supprimé avec succès',
        },
        '401': {
          description: 'Non authentifié',
        },
        '403': {
          description: 'Permission refusée (admin uniquement)',
        },
        '404': {
          description: 'Abonnement non trouvé',
        },
      },
    },
  },

  // ========== Routes Check Subscriptions ==========
  '/api/check-subscriptions': {
    get: {
      tags: ['Subscriptions'],
      summary: 'Vérifier le statut d\'un utilisateur',
      description: 'Récupérer le statut de l\'abonnement et les droits d\'un utilisateur spécifique',
      parameters: [
        {
          name: 'userId',
          in: 'query',
          required: true,
          schema: { type: 'integer' },
          description: 'ID de l\'utilisateur',
        },
      ],
      responses: {
        '200': {
          description: 'Statut de l\'utilisateur',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  userId: { type: 'integer', example: 14 },
                  email: { type: 'string', example: 'test@example.com' },
                  role: { type: 'string', enum: ['particulier', 'professionnel', 'admin'] },
                  subscriptionStatus: { type: 'string', enum: ['active', 'trialing', 'restricted', 'canceled', 'expired'], nullable: true },
                  subscription: {
                    type: 'object',
                    nullable: true,
                    properties: {
                      status: { type: 'string' },
                      trialEnd: { type: 'string', format: 'date-time', nullable: true },
                      isTrialExpired: { type: 'boolean' },
                      currentPeriodEnd: { type: 'string', format: 'date-time' },
                      autoGenerated: { type: 'boolean' },
                    },
                  },
                  canPurchase: { type: 'boolean', description: 'Peut acheter' },
                  canSell: { type: 'boolean', description: 'Peut vendre' },
                  canView: { type: 'boolean', description: 'Peut consulter' },
                },
              },
            },
          },
        },
        '400': {
          description: 'userId requis',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        '404': {
          description: 'Utilisateur non trouvé',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
    post: {
      tags: ['Subscriptions'],
      summary: 'Vérifier les abonnements expirés (CRON)',
      description: 'Endpoint pour vérifier tous les abonnements en période d\'essai et restreindre les comptes expirés. À exécuter via un cron job quotidien.',
      responses: {
        '200': {
          description: 'Vérification terminée',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Vérification des abonnements terminée' },
                  checked: { type: 'integer', example: 5 },
                  restricted: { type: 'integer', example: 2 },
                  errors: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        '500': {
          description: 'Erreur serveur',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },

  // ========== Routes Stripe ==========
  '/api/stripe/checkout': {
    post: {
      tags: ['Stripe'],
      summary: 'Créer une session de paiement Stripe',
      description: 'Créer une session de paiement Stripe Checkout pour qu\'un utilisateur puisse souscrire à l\'abonnement professionnel',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['userId'],
              properties: {
                userId: { type: 'integer', example: 14, description: 'ID de l\'utilisateur' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Session créée avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  sessionId: { type: 'string', example: 'cs_test_a1gMGqgpgQn3biNux8CRtoGw...' },
                  url: { type: 'string', example: 'https://checkout.stripe.com/c/pay/cs_test_...', description: 'URL de paiement Stripe' },
                },
              },
            },
          },
        },
        '400': {
          description: 'Erreur de validation',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'userId requis' },
                },
              },
            },
          },
        },
        '404': {
          description: 'Utilisateur ou customer Stripe non trouvé',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        '500': {
          description: 'Erreur lors de la création de la session',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string' },
                  details: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },

  '/api/stripe/webhook': {
    post: {
      tags: ['Stripe'],
      summary: 'Webhook Stripe',
      description: 'Endpoint pour recevoir les événements Stripe (checkout.session.completed, etc.). **Ne pas appeler manuellement.**',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              description: 'Événement Stripe',
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Événement traité avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  received: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        '400': {
          description: 'Signature webhook invalide',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        '500': {
          description: 'Erreur lors du traitement',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },

  // ========== Routes Test ==========
  '/api/test-create-user': {
    post: {
      tags: ['Test'],
      summary: 'Créer un utilisateur de test',
      description: '**TEST UNIQUEMENT** - Créer un utilisateur professionnel de test avec données fictives',
      responses: {
        '200': {
          description: 'Utilisateur créé avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  userId: { type: 'integer', example: 14 },
                  email: { type: 'string', example: 'test-1765239500156@example.com' },
                  message: { type: 'string', example: 'Utilisateur créé avec succès' },
                },
              },
            },
          },
        },
        '500': {
          description: 'Erreur lors de la création',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  error: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },

  // ========== Routes Profil ==========
  '/api/profile': {
    get: {
      tags: ['Profil'],
      summary: 'Récupérer le profil complet',
      description: 'Récupère toutes les informations du profil de l\'utilisateur connecté (champs modifiables uniquement)',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'Profil de l\'utilisateur',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  profile: {
                    type: 'object',
                    properties: {
                      id: { type: 'integer', example: 1 },
                      email: { type: 'string', example: 'user@example.com' },
                      firstName: { type: 'string', example: 'Jean' },
                      lastName: { type: 'string', example: 'Dupont' },
                      role: { type: 'string', enum: ['particulier', 'professionnel', 'admin'] },
                      address: {
                        type: 'object',
                        properties: {
                          street: { type: 'string', example: '123 rue Example' },
                          city: { type: 'string', example: 'Paris' },
                          postalCode: { type: 'string', example: '75001' },
                          country: { type: 'string', example: 'France' },
                        },
                      },
                      newsletterSubscription: { type: 'boolean', example: false },
                      _verified: { type: 'boolean', example: true },
                      accountStatus: { type: 'string', example: 'active' },
                      acceptedGDPR: { type: 'boolean', example: true },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' },
                      companyName: { type: 'string', example: 'Ma Société SARL', description: 'Professionnel uniquement' },
                      siret: { type: 'string', example: '12345678901234', description: 'Professionnel uniquement' },
                      website: { type: 'string', example: 'https://example.com', description: 'Professionnel uniquement' },
                      socialMedia: { type: 'object', description: 'Professionnel uniquement' },
                      isOver18: { type: 'boolean', example: true, description: 'Particulier uniquement' },
                    },
                  },
                },
              },
            },
          },
        },
        '401': {
          description: 'Non authentifié',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },

  '/api/profile/update': {
    put: {
      tags: ['Profil'],
      summary: 'Mettre à jour le profil',
      description: 'Met à jour les informations du profil. Les champs disponibles dépendent du rôle (particulier/professionnel)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                firstName: { type: 'string', example: 'Nouveau Prénom' },
                lastName: { type: 'string', example: 'Nouveau Nom' },
                address: {
                  type: 'object',
                  properties: {
                    street: { type: 'string', example: '456 rue Nouvelle' },
                    city: { type: 'string', example: 'Lyon' },
                    postalCode: { type: 'string', example: '69001' },
                    country: { type: 'string', example: 'France' },
                  },
                },
                newsletterSubscription: { type: 'boolean', example: true },
                companyName: { type: 'string', example: 'Nouvelle Société', description: 'Professionnel uniquement' },
                siret: { type: 'string', example: '98765432109876', description: 'Professionnel uniquement' },
                website: { type: 'string', example: 'https://nouveau-site.com', description: 'Professionnel uniquement' },
                socialMedia: {
                  type: 'object',
                  description: 'Professionnel uniquement',
                  properties: {
                    facebook: { type: 'string' },
                    instagram: { type: 'string' },
                    linkedin: { type: 'string' },
                    twitter: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Profil mis à jour avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Profil mis à jour avec succès' },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'integer' },
                      email: { type: 'string' },
                      firstName: { type: 'string' },
                      lastName: { type: 'string' },
                      role: { type: 'string' },
                      address: { type: 'object' },
                      newsletterSubscription: { type: 'boolean' },
                    },
                  },
                },
              },
            },
          },
        },
        '401': {
          description: 'Non authentifié',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },

  '/api/profile/change-password': {
    post: {
      tags: ['Profil'],
      summary: 'Changer le mot de passe',
      description: 'Change le mot de passe de l\'utilisateur. Le mot de passe actuel doit être fourni et validé.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['currentPassword', 'newPassword'],
              properties: {
                currentPassword: { type: 'string', example: 'ancien-mot-de-passe', description: 'Mot de passe actuel' },
                newPassword: { type: 'string', example: 'nouveau-mot-de-passe-123', description: 'Nouveau mot de passe (min. 8 caractères)' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Mot de passe changé avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Mot de passe changé avec succès' },
                },
              },
            },
          },
        },
        '400': {
          description: 'Mot de passe actuel incorrect ou nouveau mot de passe invalide',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'Mot de passe actuel incorrect' },
                },
              },
            },
          },
        },
        '401': {
          description: 'Non authentifié',
        },
      },
    },
  },

  '/api/profile/change-email': {
    post: {
      tags: ['Profil'],
      summary: 'Changer l\'email',
      description: 'Change l\'adresse email de l\'utilisateur. L\'email sera marqué comme non vérifié et un email de vérification sera envoyé.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['newEmail', 'password'],
              properties: {
                newEmail: { type: 'string', format: 'email', example: 'nouveau-email@example.com', description: 'Nouvelle adresse email' },
                password: { type: 'string', example: 'mot-de-passe-actuel', description: 'Mot de passe pour confirmation' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Email changé avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Email changé avec succès. Veuillez vérifier votre nouvel email.' },
                  newEmail: { type: 'string', example: 'nouveau-email@example.com' },
                },
              },
            },
          },
        },
        '400': {
          description: 'Email déjà utilisé, format invalide ou mot de passe incorrect',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'Cet email est déjà utilisé' },
                },
              },
            },
          },
        },
        '401': {
          description: 'Non authentifié',
        },
      },
    },
  },

  '/api/profile/notifications': {
    get: {
      tags: ['Profil'],
      summary: 'Récupérer les préférences de notifications',
      description: 'Récupère les préférences de notifications de l\'utilisateur',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'Préférences de notifications',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  notifications: {
                    type: 'object',
                    properties: {
                      newsletterSubscription: { type: 'boolean', example: false },
                    },
                  },
                },
              },
            },
          },
        },
        '401': {
          description: 'Non authentifié',
        },
      },
    },
    put: {
      tags: ['Profil'],
      summary: 'Mettre à jour les préférences de notifications',
      description: 'Met à jour les préférences de notifications de l\'utilisateur',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['newsletterSubscription'],
              properties: {
                newsletterSubscription: { type: 'boolean', example: true, description: 'Activer/désactiver la newsletter' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Préférences mises à jour',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Préférences de notifications mises à jour' },
                  notifications: {
                    type: 'object',
                    properties: {
                      newsletterSubscription: { type: 'boolean', example: true },
                    },
                  },
                },
              },
            },
          },
        },
        '400': {
          description: 'Données invalides',
        },
        '401': {
          description: 'Non authentifié',
        },
      },
    },
  },

  // ========== Routes Init Plans ==========
  '/api/init-plans': {
    get: {
      tags: ['Plans'],
      summary: 'Liste des forfaits via init-plans',
      description: 'Alternative pour récupérer la liste des forfaits',
      responses: {
        '200': {
          description: 'Liste des forfaits',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Liste des forfaits' },
                  plans: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Plan' },
                  },
                  total: { type: 'integer' },
                },
              },
            },
          },
        },
      },
    },
    post: {
      tags: ['Plans'],
      summary: 'Initialiser les forfaits par défaut',
      description: 'Créer les forfaits Particulier et Professionnel par défaut (si inexistants)',
      responses: {
        '200': {
          description: 'Forfaits déjà initialisés',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Les forfaits sont déjà initialisés' },
                  count: { type: 'integer' },
                },
              },
            },
          },
        },
        '201': {
          description: 'Forfaits initialisés avec succès',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/InitPlansResponse' },
            },
          },
        },
        '500': {
          description: 'Erreur serveur',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string' },
                  details: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },
}
