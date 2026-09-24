import { randomUUID } from 'node:crypto'

import { eq, inArray } from "drizzle-orm"

import { db, type Database } from "#db/index"
import { scans, type Scan } from "#db/schema"

export const createScan = async () => await db.transaction(async (tx) => {
  const existing = await getCurrentScan(tx)
  if(existing != null){
    return { scan: existing, existing: false }
  }
  return tx.insert(scans).values({
    id: randomUUID(),
    status: 'queued',
    totalFiles: undefined,
    processedFiles: 0,
    startedAt: new Date(),
    completedAt: undefined,
    error: undefined
  }).returning()
  .then(result => ({ scan: result.at(0)!, existing: false}))
})

export const getCurrentScan = (database: Database  = db) => database.select()
    .from(scans)
    .where(inArray(scans.status, ['queued', 'running']))
    .then(result => result?.at(0))

export const setScanStatus = (id: string, status: Scan['status']) => db.update(scans)
  .set({ status })
  .where(eq(scans.id, id))