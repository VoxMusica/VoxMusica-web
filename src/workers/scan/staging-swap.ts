import { db } from '#db/index'
import { sql } from 'drizzle-orm'

const TABLES = ['tracks', 'albums', 'artists', ] as const
export const swapStagingIntoMain = async () => {
  await db.transaction(async (tx) => {
    for (const table of TABLES) {
      await tx.run(sql.raw(`ALTER TABLE ${table} RENAME TO ${table}_old`))
      await tx.run(sql.raw(`ALTER TABLE ${table}Staging RENAME TO ${table}`))
      await tx.run(sql.raw(`ALTER TABLE ${table}_old RENAME TO ${table}Staging`))
      await tx.run(sql.raw(`DELETE FROM ${table}Staging`))
    }
  })
}
