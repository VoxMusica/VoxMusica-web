import { defineConfig } from 'drizzle-kit';

const DATA_DIR = process.env.DATA_DIR || './data';

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: `file:${DATA_DIR}/voxmusica.db`,
  },
})
