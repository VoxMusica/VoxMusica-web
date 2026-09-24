import loginRoute from '#api/web/auth/login.routes'
import meRoute from '#api/web/auth/me.routes'

import type { FastifyInstance, FastifyPluginAsync } from 'fastify'



export const authRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
 app.register(loginRoute)
 app.register(meRoute)
}

export default authRoutes

