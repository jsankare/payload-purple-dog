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
import { Posts } from "@/collections/Page";
import { Plans } from './collections/Plans'
import { Subscriptions } from './collections/Subscriptions'
import { Feedback } from './collections/Feedback'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Plans, Subscriptions, Posts, Feedback],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
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
  }
})
