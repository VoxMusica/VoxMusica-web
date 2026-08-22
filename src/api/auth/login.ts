import { findUserByUsername, verifyPassword } from '#services/users/users.service'
import type { FastifyInstance } from 'fastify'

export const registerLoginRoute = (fastify: FastifyInstance) => {
  fastify.post('/login', async (request, reply) => {
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

    const token = fastify.jwt.sign(
      { sub: user.id, username: user.username },
      { expiresIn: config }
    );

    return reply.send({ token });
  });
}

export default registerLoginRoute