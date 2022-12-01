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

export type Schedule = (Lesson | LessonWithVariants)[][]

export type RawLessons = {
  id: Id
  lessons: Lesson | LessonWithVariants
}

export type LessonWithVariants = {
  name?: string
  variants: Omit<Lesson, 'name'>[]
}

export type Lesson = {
  type?: string
  odd?: string
  subgroup?: string
  name?: string
  teacher?: string
  location?: string
}

export type LessonSpecials = {
  type?: string
  odd?: string
  subgroup?: string
}

export type LessonName = {
  name?: string
}

export type LessonTeacher = {
  teacher?: string
}

export type LessonLocation = {
  location?: string
}

type Id = `${number}_${number}`
