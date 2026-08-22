import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'

import { db } from '#db/index'
import { users } from '#db/schema'

export async function findUserByUsername(username: string) {
  const result = await db.select().from(users).where(eq(users.username, username))
  return result[0] ?? null
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export async function createUser(username: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 12);
  const result = await db.insert(users).values({
    id: randomUUID(),
    username,
    passwordHash,
    createdAt: Date.now(),
  }).returning();
  return result[0];
}
