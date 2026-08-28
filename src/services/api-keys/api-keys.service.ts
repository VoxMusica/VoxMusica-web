import { createHash, randomBytes } from "node:crypto"

import { and, eq } from "drizzle-orm"

import { db } from "#db/index"
import { apiKeys } from "#db/schema"

export const getActiveKeysForUser = (userId: string) => db
  .select({
    id: apiKeys.id,
    label: apiKeys.label,
    lastUsedAt: apiKeys.lastUsedAt,
    createdAt: apiKeys.createdAt,
    expiresAt: apiKeys.expiresAt
  })
  .from(apiKeys)
  .where(and(eq(apiKeys.userId, userId), eq(apiKeys.isSystem, false)))

const getKeyHash = (raw: string) => createHash('sha256').update(raw).digest('hex')

const generateApiKey = () => {
  const raw = randomBytes(72).toString('base64url')
  const hash = getKeyHash(raw)
  return { raw, hash }
}

interface CreateKey{
  userId: string
  expiresAt?: Date
  isSystem: boolean
  label?: string
}

export const createApiKey = async ({userId, expiresAt, isSystem, label}: CreateKey) => {
  const { raw: apiKey, hash: keyHash } = generateApiKey()
  const result = await db
    .insert(apiKeys)
    .values({
      userId, keyHash, isSystem,
      ...(expiresAt ? { expiresAt } : {}),
      ...(label ? { label } : {}),
    })
    .returning({
      apiKeyId: apiKeys.id,
      label: apiKeys.label,
      createdAt: apiKeys.createdAt,
      expiresAt: apiKeys.expiresAt,
      lastUsedAt: apiKeys.lastUsedAt
    })
    .then(v => v.at(0))

  return { apiKey, ...result }
} 

interface DeleteApiKey{
  id: string
  userId: string
  isSystem: boolean
}
export const removeApiKey = async ({id, userId, isSystem} : DeleteApiKey) => db
      .delete(apiKeys)
      .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId), eq(apiKeys.isSystem, isSystem)))
      .returning({ id: apiKeys.id })

export const findApiKeyByValue = (keyValue: string) => db.select({
    id: apiKeys.id,
    label: apiKeys.label,
    lastUsedAt: apiKeys.lastUsedAt,
    createdAt: apiKeys.createdAt,
    expiresAt: apiKeys.expiresAt,
    userId: apiKeys.userId
  })
  .from(apiKeys)
  .where(eq(apiKeys.keyHash, getKeyHash(keyValue)))
  .then(v => v?.at(0) ?? null)

export const findApiKeyById = (id: string) => db.select({
    id: apiKeys.id,
    label: apiKeys.label,
    lastUsedAt: apiKeys.lastUsedAt,
    createdAt: apiKeys.createdAt,
    expiresAt: apiKeys.expiresAt,
    userId: apiKeys.userId
  })
  .from(apiKeys)
  .where(eq(apiKeys.id, getKeyHash(id)))
  .then(v => v?.at(0) ?? null)

  export const touchApiKeyLastUsed = (id: string) => db
    .update(apiKeys)
    .set({lastUsedAt: new Date()})
    .where(eq(apiKeys.id, id))
