import Fastify from 'fastify'
import cors from '@fastify/cors'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'
import { getNewsPage, getSchedule } from '../core'
import { logger } from '../logger'

const fastify = Fastify({
  logger: logger
})

fastify.get('/news', async (request, reply) => {
  const news = await getNewsPage()
  pipe(
    news,
    O.match(
      () => {
        reply.status(500).send('Failed to get news')
      },
      (news) => {
        reply.status(200).send(news)
      }
    )
  )
})

fastify.get('/schedule', async (request, reply) => {
  const url = (request.query as { url: string }).url
  const schedule = await getSchedule(url)
  pipe(
    schedule,
    O.match(
      () => {
        reply.status(500).send('Failed to get schedule')
      },
      (news) => {
        reply.status(200).send(news)
      }
    )
  )
})

export async function startApp() {
  await fastify.register(cors)

  fastify.listen({ port: 3001 }, function (err) {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }
  })
}
