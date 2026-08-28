import { join } from 'node:path'

import cachingPlugin from '@fastify/caching'
import fastifyCookie from '@fastify/cookie'
import jwt from '@fastify/jwt'
import Fastify from 'fastify'
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'


import { apiRoutes } from '#api/index'
import { cache } from '#cache'
import { config } from '#config'
import logger from '#logger'
import authenticatePlugin from '#plugins/authenticate'
import isAdminPlugin from '#plugins/is-admin'
import isAdminOrBootstrap from '#plugins/is-admin-or-bootstrap'

const logDir = config.get('logging.dir')
const logLevel = config.get('logging.level')
const logFilename =  config.get('logging.filename')

// const engine = new Engine();

// await engine.start()
const app = Fastify({
  loggerInstance: logger(logDir
    ? {
        level: logLevel,
        transport: {
          targets: [
            { target: 'pino/file', options: { destination: 1 } }, // 1 = stdout, always keep this
            {
              target: 'pino/file',
              options: { destination: join(logDir, logFilename) },
            },
          ],
        },
      }
    : { level: logLevel }  // stdout only, default Pino behavior
  ),
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifyCookie, {
  secret: config.get('auth.cookieSecret'),
})
app.register(jwt, {
  secret: config.get('auth.jwtSecret'),
  cookie: {
    cookieName: 'session',
    signed: true
  }
})
app.register(authenticatePlugin)
app.register(isAdminPlugin)
app.register(isAdminOrBootstrap)




app.register(cachingPlugin, { cache })

app.register(apiRoutes)
app.setErrorHandler((error, request, reply) => {
  request.log.error({ err: error }, 'unhandled error') // full detail server-side only

  const statusCode = error?.statusCode ?? 500

  reply.status(statusCode).send({
    error: statusCode === 500 ? 'Internal server error' : error.message,
    statusCode,
  })
})

app.decorateRequest('subsonicUser', undefined)

app.listen({
  port: config.get('server.port'),
  host: config.get('server.host'),
}, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  app.log.info(`server listening on ${address}`)
})
