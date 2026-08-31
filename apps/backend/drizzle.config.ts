import path from 'node:path'

import { defineConfig } from 'drizzle-kit'

import { loadConfig } from "./src/services/config/load.ts"

const config = loadConfig()
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: `file:${path.join(config.get('data.dir'), config.get('data.filename'))}`,
  },
  verbose: true,
})
