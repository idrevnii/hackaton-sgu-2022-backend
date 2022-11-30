export type NewsContainer = {
  command: 'insert'
  data: string
  method: string
  selector: string
}

type INews = {
  title: string
  time: string
}

export type News = {
  date: string // 29 ноября
  events: INews[] // [ {title: 'Новость 1', time: '18:35'}, {...} ]
}
