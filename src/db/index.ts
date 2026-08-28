import path from 'node:path'

import { createClient, type ResultSet } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'

import config from '#config'
import * as schema from '#db/schema'


import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core'

export type Database = BaseSQLiteDatabase<
  'async',
  ResultSet,
  typeof schema
>;

const client = createClient({
  url: `file:${path.join(config.get('data.dir'), config.get('data.filename'))}`,
});

export const db = drizzle(client, { schema, })
