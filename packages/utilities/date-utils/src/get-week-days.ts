import { CalendarDate, startOfWeek } from "@internationalized/date"

export function getWeekDays(date: CalendarDate, timeZone: string, locale: string) {
  const weekStart = startOfWeek(date, locale)
  let weekArr = [...new Array(7).keys()]
  return weekArr.map((index) => {
    return weekStart.add({ days: index }).toDate(timeZone)
  })
}
