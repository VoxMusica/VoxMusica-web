import path from "node:path"

import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import { migrate } from "drizzle-orm/libsql/migrator"

import { loadConfig } from "#services/config/load"

import type { Logger } from 'pino'

export const migrateConfig = async (logger: Logger) => {
  const config = loadConfig()

  const url = `file:${path
    .join(config.get("data.dir"), config.get("data.filename"))
    .replaceAll("\\", "/")}`

  const client = createClient({ url })
  const db = drizzle(client)
  await migrate(db, {
    migrationsFolder: "./drizzle",
  })

  logger.info("Database migrations complete")
}
