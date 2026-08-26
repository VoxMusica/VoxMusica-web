import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import loginRoute from '#api/web/auth/login.route'
import meRoute from '#api/web/auth/me.route'

export const authRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
 app.register(loginRoute)
 app.register(meRoute)
}

export default authRoutes

