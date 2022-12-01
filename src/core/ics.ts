import * as O from 'fp-ts/Option'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import { createEvents, EventAttributes } from 'ics'
import { Schedule } from './models'
import { getSchedule } from './schedule'
import { getDayTime } from './date'

export function createCalendar(schedule: Schedule): O.Option<string> {
  const dateFun = getDayTime()
  const events = schedule
    .map((day, dayIndex) =>
      day
        .map((lesson) => {
          if (lesson.start) {
            let name = lesson.name
            let teacher
            let location

            if ('teacher' in lesson) {
              teacher = lesson.teacher
            }
            if ('location' in lesson) {
              location = lesson.location
            }

            if ('variants' in lesson) {
              name = lesson.variants[0].name
              teacher = lesson.variants[0].teacher
              location = lesson.variants[0].location
            }

            const description =
              `${teacher ? teacher : ''}` + ` ${location ? location : ''}`
            return {
              title: name,
              description,
              start: dateFun(dayIndex, lesson.start),
              duration: { hours: 1, minutes: 30 }
            }
          }
          return
        })
        .filter(Boolean)
    )
    .flat() as EventAttributes[]
  //   console.log(events.flat())
  const { error, value } = createEvents(events)
  if (error) {
    return O.none
  }

  if (value && value.length === 0) {
    return O.none
  }

  return O.fromNullable(value)
}

export async function getCalendar(url: string) {
  const schedule = await getSchedule(url)
  return pipe(
    schedule,
    O.match(
      () => {
        return E.left(
          'Failed to create Calendar, reason: \nFailed to get schedule'
        )
      },
      (schedule) => {
        return pipe(
          schedule,
          createCalendar,
          O.match(
            () =>
              E.left('Failed to create calendar, reason: \nSomething broken'),
            (calendar) => E.right(calendar)
          )
        )
      }
    )
  )
}
