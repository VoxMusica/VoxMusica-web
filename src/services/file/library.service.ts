import { db } from "#db/index"

export const isScanRunning = async () => {
  const result = await db.select({ count: count() }).from(users)
  return result?.at(0)?.count ?? 0
}