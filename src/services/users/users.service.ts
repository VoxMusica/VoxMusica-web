import bcrypt from 'bcrypt'
import { count, eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'

import { db } from '#db/index'
import { users } from '#db/schema'
import { parseRoles, type Role } from './model/role.ts'

export const getUserCount = async () => {
  const result = await db.select({ count: count() }).from(users)
  return result?.at(0)?.count ?? 0
}

export const findUserByUsername = async (username: string) => {
  const result = await db.select().from(users).where(eq(users.username, username))
  return result[0] ?? null
}

export const verifyPassword = async (plain: string, hash: string) => {
  return bcrypt.compare(plain, hash);
}

export function hasRole(rolesRaw: string, role: Role): boolean {
  return parseRoles(rolesRaw).includes(role)
}

type CreateUserInput = { username: string, password: string, roles: Role[] }
export const createUser = async ({ username, password, roles } : CreateUserInput) => {
  const passwordHash = await bcrypt.hash(password, 12);
  const result = await db.insert(users).values({
    id: randomUUID(),
    username,
    passwordHash,
    roles: JSON.stringify(roles),
    createdAt: Date.now(),
  }).returning();
  return result[0];
}
