import dayjs from 'dayjs'

function getMonday() {
  const now = dayjs()
  const nowWeek = now.day()
  return now.subtract(nowWeek - 1, 'day')
}

export function getDayTime() {
  const monday = getMonday()
  return (day: number, time: string) => {
    const [hours, minutes] = time.split(':').map((num) => +num)
    return monday
      .add(day, 'day')
      .hour(hours)
      .minute(minutes)
      .format('YYYY-M-D-H-m')
      .split('-')
      .map((num) => +num)
  }
}
