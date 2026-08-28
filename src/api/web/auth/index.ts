import loginRoute from '#api/web/auth/login.route'
import meRoute from '#api/web/auth/me.route'

import type { FastifyInstance, FastifyPluginAsync } from 'fastify'

export const authRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
 app.register(loginRoute)
 app.register(meRoute)
}

export default authRoutes

