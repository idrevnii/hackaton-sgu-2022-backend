import { parse } from 'node-html-parser'
import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'
import { post } from '../api'
import { logger } from '../logger'
import { News, NewsContainer } from './models'

function pickNewsContainer(data: Record<string, string>[]): NewsContainer {
  return data.find((item) => item.command === 'insert') as NewsContainer
}

function parseNewsFromContainer(container: NewsContainer) {
  const root = parse(container.data)

  const news = root.querySelectorAll('div.view-content')

  const regex = /[а-яА-Я]/
  const newsList = news[0].childNodes.filter((item) => regex.test(item.rawText))

  return newsList.reduce((acc, node) => {
    const innerRoot = parse(node.toString())

    const h3 = innerRoot.querySelector('h3')
    if (h3) {
      return [
        ...acc,
        {
          date: h3.innerText,
          events: []
        }
      ]
    }
    const time = innerRoot.querySelector('.date-display-single')
    const title = innerRoot.querySelector('a')

    acc[acc.length - 1].events.push({
      time: time!.innerText,
      title: title!.innerText
    })
    return acc
  }, [] as News[])
}

export async function getNewsPage(page = 0) {
  const url = 'https://www.sgu.ru/views/ajax'

  const data = `page=${page}&view_name=mainnews&view_display_id=newsfilter`

  const response = await post<Record<string, string>[]>(url, data)

  return pipe(
    response,
    E.match(
      (error) => {
        logger.error(`Failed to get news, reason: \n${error}`)
        return O.none
      },
      (data) => pipe(pickNewsContainer(data), parseNewsFromContainer, O.some)
    )
  )
}
