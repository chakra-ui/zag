import { CalendarDate, getDayOfWeek, isSameDay, startOfWeek } from "@internationalized/date"

export type DatesInWeek = (CalendarDate | null)[]

export function getDatesInWeek(weekIndex: number, from: CalendarDate, locale: string) {
  let date: CalendarDate = from.add({ weeks: weekIndex })
  let dates: (CalendarDate | null)[] = []

  date = startOfWeek(date, locale)

  let dayOfWeek = getDayOfWeek(date, locale)
  for (let i = 0; i < dayOfWeek; i++) {
    dates.push(null)
  }

  while (dates.length < 7) {
    dates.push(date)
    let nextDate = date.add({ days: 1 })
    if (isSameDay(date, nextDate)) break
    date = nextDate
  }

  while (dates.length < 7) {
    dates.push(null)
  }

  return dates
}
