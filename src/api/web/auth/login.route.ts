import config from '#config'
import { parseRoles } from '#services/users/model/role'
import { findUserByUsername, verifyPassword } from '#services/users/users.service'
import type { FastifyInstance, FastifyPluginAsync, FastifyReply } from 'fastify'
import ms, { type StringValue } from 'ms'

export const loginRoute: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.post('/login', async (request, reply: FastifyReply) => {
    const { username, password } = request.body as { username: string; password: string };

    if (!username || !password) {
      return reply.code(400).send({ error: 'Missing username or password' });
    }

    const user = await findUserByUsername(username);
    if (!user) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }
  
    const userPayload = { sub: user.id, username: user.username, roles: parseRoles(user.roles) }
    const token = app.jwt.sign(userPayload,{ expiresIn: config.get('auth.tokenExpiry') })

    reply.setCookie('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ms(config.get('auth.tokenExpiry') as StringValue) / 1000,
      path: '/',
      signed: true
    })

    return reply.send({ user: userPayload })
  });
}

export default loginRoute