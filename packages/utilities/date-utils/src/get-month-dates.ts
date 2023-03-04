import {
  CalendarDate,
  DateDuration,
  getDayOfWeek,
  getWeeksInMonth,
  isSameDay,
  startOfWeek,
} from "@internationalized/date"

function getWeekDates(index: number, fromDate: CalendarDate, locale: string) {
  let date = startOfWeek(fromDate.add({ weeks: index }), locale)

  let dates: (CalendarDate | null)[] = []

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

export function getMonthDates(startDate: CalendarDate, duration: DateDuration, locale: string) {
  const numOfWeeks = duration.weeks ?? getWeeksInMonth(startDate, locale)
  const weeks = [...new Array(numOfWeeks).keys()]
  return weeks.map((week) => getWeekDates(week, startDate, locale))
}
