import Fastify from 'fastify'
import cors from '@fastify/cors'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'
import { getNewsPage, getSchedule } from '../core'
import { logger } from '../logger'
import { createCalendar } from '../core/ics'

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
      (schedule) => {
        createCalendar(schedule)
        reply.status(200).send(schedule)
      }
    )
  )
})

fastify.get('/calendar', async (request, reply) => {
  const url = (request.query as { url: string }).url
  const schedule = await getSchedule(url)
  pipe(
    schedule,
    O.match(
      () => {
        reply.status(500).send('Failed to get schedule')
      },
      (schedule) => {
        const calendar = createCalendar(schedule)
        pipe(
          calendar,
          O.match(
            () => {
              reply.status(500).send('Failed to create calendar')
            },
            (calendar) => {
              reply
                .status(200)
                .header('Content-Type', 'application/octet-stream')
                .header(
                  'Content-Disposition',
                  'attachment; filename=calendar.ics'
                )
                .send(calendar)
            }
          )
        )
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
