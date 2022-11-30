import Fastify from 'fastify'
import { logger } from '../logger'

const fastify = Fastify({
  logger: logger
})

fastify.get('/', async (request, reply) => {
  return { hello: 'world' }
})

export function startApp() {
  fastify.listen({ port: 3000 }, function (err, address) {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }
    fastify.log.info(`Server is now listening on ${address}`)
  })
}
