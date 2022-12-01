import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'
import parse, { Node, TextNode } from 'node-html-parser'
import { logger } from '../logger'
import { get } from './../api'
import {
  Schedule,
  Lesson,
  LessonWithVariants,
  LessonSpecials,
  LessonName,
  LessonTeacher,
  LessonLocation
} from './models'

export async function getSchedule(url: string) {
  const options = {
    headers: { Accept: 'application/json', 'Accept-Encoding': 'identity' }
  }
  const response = await get<string>(url, options)

  return pipe(
    response,
    E.match(
      (error) => {
        logger.error(`Failed to get schedule, reason: \n${error}`)
        return O.none
      },
      (data) => {
        const root = parse(data)
        const raw = root.querySelectorAll('tr > td')

        return O.some(
          raw
            .filter((node) => node.attributes.id)
            .map((node) => ({
              id: node.attributes.id,
              lesson: parseLesson(node.childNodes)
            }))
            .reduce<Schedule>((accum, { id, lesson }) => {
              const [period, day] = id.split('_').map((num) => +num - 1)
              const arr = [...accum]
              arr[day] = [...(arr[day] ?? [])]
              arr[day][period] = lesson
              return arr
            }, [])
        )
      }
    )
  )
}

function parseLesson(rawLessons: Node[]) {
  const parseMap = [parseSpecials, parseName, parseTeacher, parseAuditory]

  if (rawLessons.length > 0) {
    // if lesson div not empty
    const parsedLesson = rawLessons.map(({ childNodes: lesson }) =>
      lesson.reduce<Lesson>(
        (accum, { childNodes: lessonProperties }, index) =>
          parseMap[index]
            ? { ...accum, ...parseMap[index](lessonProperties) }
            : accum,
        {}
      )
    )

    // if common lesson
    if (parsedLesson.length === 1) {
      return parsedLesson[0]
    }

    // if lessons with subgroups and odd
    return parsedLesson.reduce<LessonWithVariants>(
      (accum, { type, odd, subgroup, name, teacher, location: auditory }) => {
        return {
          ...accum,
          variants: [
            ...accum.variants,
            {
              name,
              type,
              ...(odd ? { odd } : {}),
              ...(subgroup ? { subgroup } : {}),
              teacher,
              location: auditory
            }
          ]
        }
      },
      { variants: [] }
    )
  }
  return {}
}

function parseSpecials(propetyNodes: Node[]): LessonSpecials {
  if (propetyNodes.length === 3) {
    const [odd, type, subgroup] = propetyNodes.map((node) => node.text)
    return {
      ...(odd ? { odd } : {}),
      ...(type ? { type } : {}),
      ...(subgroup ? { subgroup } : {})
    }
  }
  return {}
}

function parseName(nameNode: Node[]): LessonName {
  if (nameNode.length === 1 && nameNode[0] instanceof TextNode) {
    return { name: nameNode[0].text }
  }
  return {}
}

function parseTeacher(teacherNode: Node[]): LessonTeacher {
  if (teacherNode.length === 1) {
    return { teacher: teacherNode[0].text }
  }
  return {}
}

function parseAuditory(auditoryNode: Node[]): LessonLocation {
  if (auditoryNode.length === 1 && auditoryNode[0] instanceof TextNode) {
    return { location: auditoryNode[0].text }
  }
  return {}
}
