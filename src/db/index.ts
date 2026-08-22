import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'

import config from '#config'
import * as schema from '#db/schema'
import path from 'node:path'

const client = createClient({
  url: `file:${path.join(config.get('data.dir'), config.get('data.filename'))}`,
});

export const db = drizzle(client, { schema })
