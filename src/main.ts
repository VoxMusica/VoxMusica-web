import { join } from 'node:path'
import Fastify from 'fastify'
import cachingPlugin from '@fastify/caching'
import jwt from '@fastify/jwt'
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'

// `abstract-cache` does not ship TypeScript declarations.
// @ts-expect-error The package is untyped; its runtime API is used below.
import abstractCache from 'abstract-cache'

import { config } from '#config'

import { apiRoutes } from '#api/index'
import authenticatePlugin from '#plugins/authenticate'
import isAdminPlugin from '#plugins/is-admin'
import isAdminOrBootstrap from '#plugins/is-admin-or-bootstrap'
import fastifyCookie from '@fastify/cookie'
import { redis } from '#redis'
// import { Engine } from '#services/engine/engine'

const logDir = config.get('logging.dir')
const logLevel = config.get('logging.level')
const logFilename =  config.get('logging.filename')

// const engine = new Engine();

// await engine.start()

const app = Fastify({
  logger: logDir
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
    : { level: logLevel }, // stdout only, default Pino behavior
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



const cache = abstractCache({
  useAwait: true,
  driver: {
    name: 'abstract-cache-redis',
    options: { client: redis },
  },
})
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
}, function (err, address) {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  app.log.info(`server listening on ${address}`)
})
