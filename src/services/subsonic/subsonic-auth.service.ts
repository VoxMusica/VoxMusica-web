import bcrypt from 'bcrypt'
import { findUserByUsername } from '#services/users/users.service'

interface SubsonicAuthParams {
  u?: string
  p?: string
}

export async function verifySubsonicCredentials(params: SubsonicAuthParams) {
  const { u, p } = params

  if (!u || !p) return null;

  const user = await findUserByUsername(u)
  if (!user) return null;

  // Subsonic clients may hex-encode the password with an "enc:" prefix
  // to avoid literal special characters breaking URL query parsing —
  // this is NOT encryption, just hex encoding, so it adds no real security on its own.
  const submitted = p.startsWith('enc:')
    ? Buffer.from(p.slice(4), 'hex').toString('utf-8')
    : p;

  const valid = await bcrypt.compare(submitted, user.passwordHash);
  return valid ? user : null;
}
