import swaggerJsdoc from 'swagger-jsdoc'
import { swaggerSchemas } from './swagger/schemas'
import { swaggerPaths } from './swagger/paths'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Payload Purple Dog API',
      version: '1.0.0',
      description: `
        API complète pour une plateforme de vente et enchères de produits de valeur.
        
        ## Types d'utilisateurs
        
        - **Particuliers** : Forfait gratuit avec accès illimité
        - **Professionnels** : Forfait à 49€/mois (1 mois gratuit) avec accès illimité
        - **Admin** : Gestion complète de la plateforme
        
        ## Système de Forfaits
        
        La plateforme propose un système de forfaits modulable :
        - Forfaits modifiables depuis le back office (admin uniquement)
        - Abonnements avec période d'essai
        - Historique complet des abonnements
      `,
      contact: {
        name: 'API Support',
        url: 'https://github.com/jsankare/payload-purple-dog',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement',
      },
      {
        url: 'https://api.production.com',
        description: 'Serveur de production',
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoints d\'authentification (inscription, connexion, mot de passe)',
      },
      {
        name: 'Users',
        description: 'Gestion des utilisateurs',
      },
      {
        name: 'Media',
        description: 'Upload et gestion de fichiers (K-Bis, photos, documents)',
      },
      {
        name: 'Plans',
        description: 'Gestion des forfaits d\'abonnement (Admin uniquement pour création/modification)',
      },
      {
        name: 'Subscriptions',
        description: 'Gestion des abonnements utilisateurs (Admin uniquement pour création/modification)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT obtenu via /api/users/login',
        },
      },
      schemas: swaggerSchemas,
    },
    paths: {
      ...swaggerPaths,
      // Routes existantes (Users, Media, etc.)
      '/api/users': {
        post: {
          tags: ['Authentication', 'Users'],
          summary: 'Inscription d\'un nouvel utilisateur',
          description: 'Créer un compte particulier ou professionnel. Les champs requis varient selon le rôle.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    { $ref: '#/components/schemas/UserParticulier' },
                    { $ref: '#/components/schemas/UserProfessionnel' },
                  ],
                },
                examples: {
                  particulier: {
                    summary: 'Inscription Particulier',
                    value: {
                      email: 'jean.particulier@test.com',
                      password: 'TestPassword123!',
                      role: 'particulier',
                      firstName: 'Jean',
                      lastName: 'Dupont',
                      address: {
                        street: '123 Rue de la Paix',
                        city: 'Paris',
                        postalCode: '75001',
                        country: 'France',
                      },
                      age: 35,
                      isOver18: true,
                      acceptedGDPR: true,
                      newsletterSubscription: false,
                    },
                  },
                  professionnel: {
                    summary: 'Inscription Professionnel',
                    value: {
                      email: 'contact@entreprise.com',
                      password: 'TestPassword123!',
                      role: 'professionnel',
                      firstName: 'Marie',
                      lastName: 'Martin',
                      companyName: 'Antiquités Durand SARL',
                      siret: '12345678901234',
                      officialDocument: 1,
                      address: {
                        street: '456 Avenue du Commerce',
                        city: 'Lyon',
                        postalCode: '69001',
                        country: 'France',
                      },
                      website: 'https://www.entreprise.fr',
                      specialties: [{ specialty: 'Antiquités' }, { specialty: 'Art' }],
                      soughtItems: [{ item: 'Meubles anciens' }],
                      socialMedia: {
                        facebook: 'https://facebook.com/entreprise',
                        instagram: '@entreprise',
                      },
                      acceptedTerms: true,
                      acceptedMandate: true,
                      acceptedGDPR: true,
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Utilisateur créé avec succès',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      doc: { $ref: '#/components/schemas/UserResponse' },
                      message: { type: 'string', example: 'User successfully created.' },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Erreur de validation',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
        get: {
          tags: ['Users'],
          summary: 'Liste des utilisateurs',
          description: 'Récupérer la liste des utilisateurs (Admin: tous, Utilisateur: son propre profil)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 10 },
              description: 'Nombre de résultats',
            },
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
              description: 'Numéro de page',
            },
          ],
          responses: {
            '200': {
              description: 'Liste des utilisateurs',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      docs: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/UserResponse' },
                      },
                      totalDocs: { type: 'integer' },
                      limit: { type: 'integer' },
                      page: { type: 'integer' },
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
      '/api/users/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Connexion utilisateur',
          description: 'Authentification et obtention d\'un token JWT',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' },
              },
            },
          },
          responses: {
            '200': {
              description: 'Connexion réussie',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/LoginResponse' },
                },
              },
            },
            '401': {
              description: 'Identifiants incorrects',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/api/users/me': {
        get: {
          tags: ['Users'],
          summary: 'Profil utilisateur connecté',
          description: 'Récupérer les informations de l\'utilisateur authentifié',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Profil utilisateur',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      user: { $ref: '#/components/schemas/UserResponse' },
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
      '/api/users/logout': {
        post: {
          tags: ['Authentication'],
          summary: 'Déconnexion',
          description: 'Déconnecter l\'utilisateur et invalider le token',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Déconnexion réussie',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Logged out successfully' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/users/forgot-password': {
        post: {
          tags: ['Authentication'],
          summary: 'Mot de passe oublié',
          description: 'Demander un lien de réinitialisation de mot de passe',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'user@example.com' },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Email de réinitialisation envoyé',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Success' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/users/reset-password': {
        post: {
          tags: ['Authentication'],
          summary: 'Réinitialiser le mot de passe',
          description: 'Réinitialiser le mot de passe avec le token reçu par email',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['token', 'password'],
                  properties: {
                    token: { type: 'string', description: 'Token de réinitialisation reçu par email' },
                    password: { type: 'string', format: 'password', minLength: 8, example: 'NewPassword123!' },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Mot de passe réinitialisé',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Password reset successfully' },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Token invalide ou expiré',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/api/users/verify': {
        get: {
          tags: ['Authentication'],
          summary: 'Vérification d\'email',
          description: 'Vérifier l\'email avec le token reçu',
          parameters: [
            {
              name: 'token',
              in: 'query',
              required: true,
              schema: { type: 'string' },
              description: 'Token de vérification',
            },
          ],
          responses: {
            '200': {
              description: 'Email vérifié',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Email vérifié avec succès' },
                      user: { $ref: '#/components/schemas/UserResponse' },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Token invalide',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/api/media': {
        post: {
          tags: ['Media'],
          summary: 'Upload d\'un fichier',
          description: 'Upload un document ou une image (K-Bis, photo de profil, etc.)',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    file: {
                      type: 'string',
                      format: 'binary',
                      description: 'Fichier à uploader',
                    },
                    alt: {
                      type: 'string',
                      description: 'Texte alternatif (optionnel)',
                    },
                  },
                  required: ['file'],
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Fichier uploadé',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      doc: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer' },
                          filename: { type: 'string' },
                          mimeType: { type: 'string' },
                          filesize: { type: 'integer' },
                          url: { type: 'string' },
                        },
                      },
                      message: { type: 'string', example: 'Media successfully created.' },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Erreur d\'upload',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
        get: {
          tags: ['Media'],
          summary: 'Liste des médias',
          description: 'Récupérer la liste des fichiers uploadés',
          parameters: [
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 10 },
            },
          ],
          responses: {
            '200': {
              description: 'Liste des médias',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      docs: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'integer' },
                            filename: { type: 'string' },
                            url: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
}

export const swaggerSpec = swaggerJsdoc(options)
