import bcrypt from 'bcrypt'


import { findApiKeyByValue, touchApiKeyLastUsed } from '#services/api-keys/api-keys.service'
import { findUserById, findUserByUsername } from '#services/users/users.service'

import type { FastifyBaseLogger } from 'fastify'

interface SubsonicAuthParams {
  u?: string
  p?: string
  apiKey?: string
}

export const verifySubsonicCredentials = async (params: SubsonicAuthParams, logger?: FastifyBaseLogger) => {
  const { u, p, apiKey } = params

  // OpenSubsonic API key auth — takes priority if present
  if (apiKey) {
    logger?.debug(`Logging with apikey`)
    const key = await findApiKeyByValue(apiKey)
    if (!key){
      logger?.warn('Logging with unknown api key')
      return null
    }

    if (key.expiresAt && key.expiresAt < new Date()){
      logger?.warn(`Logging with expired api key id: '${key.id}'`)
      return null
    }

    const user = await findUserById(key.userId)
    if (!user){
      logger?.warn(`Api key '${key.id}' is attached to a unknown user with id '${key.userId}'`)
      return null
    }

    await touchApiKeyLastUsed(key.id)

    return user
  }

  // Legacy username/password (and token) auth
  if (!u || !p) return null

  const user = await findUserByUsername(u)
  if (!user) return null

  const submitted = p.startsWith('enc:')
    ? Buffer.from(p.slice(4), 'hex').toString('utf-8')
    : p

  const valid = await bcrypt.compare(submitted, user.passwordHash)
  return valid ? user : null
}