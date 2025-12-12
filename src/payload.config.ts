import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { resendAdapter } from '@payloadcms/email-resend'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { en } from 'payload/i18n/en'
import { fr } from 'payload/i18n/fr'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Posts } from "@/collections/Page"
import { Plans } from './collections/Plans'
import { Subscriptions } from './collections/Subscriptions'
import { Objects } from './collections/Objects'
import { Feedback } from './collections/Feedback'
import { Categories } from './collections/Categories'
import { Bids } from './collections/Bids'
import { Offers } from './collections/Offers'
import { Favorites } from './collections/Favorites'
import { Transactions } from './collections/Transactions'
import { Settings } from './globals/Settings'

import { migrations } from '@/migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    dateFormat: 'd MMMM yyyy, HH:mm',
  },
  cors: [
    'http://localhost:3001',
    'http://localhost:3000',
    'http://localhost:4000',
    process.env.NEXT_PUBLIC_FRONTEND_URL || '',
  ].filter(Boolean),
  csrf: [
    'http://localhost:3001',
    'http://localhost:3000',
    'http://localhost:4000',
    process.env.NEXT_PUBLIC_FRONTEND_URL || '',
  ].filter(Boolean),
  collections: [
    Users,
    Media,
    Plans,
    Subscriptions,
    Posts,
    Objects,
    Feedback,
    Categories,
    Bids,
    Offers,
    Favorites,
    Transactions,
  ],
  globals: [Settings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    prodMigrations: migrations,
  }),
  email: resendAdapter({
    defaultFromAddress: process.env.RESEND_DEFAULT_EMAIL || 'onboarding@resend.dev',
    defaultFromName: process.env.RESEND_DEFAULT_NAME || 'Purple Dog',
    apiKey: process.env.RESEND_API_KEY || '',
  }),
  sharp,
  plugins: [],
  i18n: {
    fallbackLanguage: 'fr',
    supportedLanguages: { en, fr },
  },
})
