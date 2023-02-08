import { CalendarDate, getDayOfWeek, isSameDay, startOfWeek } from "@internationalized/date"

export type DatesInWeek = (CalendarDate | null)[]

export function getDatesInWeek(weekIndex: number, fromDate: CalendarDate, locale: string) {
  let date: CalendarDate = fromDate.add({ weeks: weekIndex })
  let dates: (CalendarDate | null)[] = []

  date = startOfWeek(date, locale)
  let dayOfWeek = getDayOfWeek(date, locale)

  for (let i = 0; i < dayOfWeek; i++) {
    dates.push(null)
  }

  while (dates.length < 7) {
    dates.push(date)
    let nextDate = date.add({ days: 1 })
    if (isSameDay(date, nextDate)) {
      break
    }
    date = nextDate
  }

  while (dates.length < 7) {
    dates.push(null)
  }

  return dates
}

export function getWeekDates(fromDate: CalendarDate, timeZone: string, locale: string) {
  let weekStart = startOfWeek(fromDate, locale)
  let weekArr = [...new Array(7).keys()]

  return weekArr.map((index) => {
    return weekStart.add({ days: index }).toDate(timeZone)
  })
}
