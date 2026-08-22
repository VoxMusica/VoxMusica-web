import 'dotenv/config'
import Fastify from 'fastify'
import jwt from '@fastify/jwt'

import { config } from '#config'

import { routes } from '#api/index'
import { join } from 'node:path'
// import { Engine } from '#services/engine/engine'

const logDir = config.get('logging.dir')
const logLevel = config.get('logging.level')
const logFilename =  config.get('logging.filename')

// const engine = new Engine();

// await engine.start()

const fastify = Fastify({
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

fastify.register(jwt, {
  secret: config.get('auth.jwtSecret'),
})

fastify.register(routes, { prefix: '/rest' })

fastify.listen({
  port: config.get('server.port'),
  host: config.get('server.host'),
}, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${address}`)
})
