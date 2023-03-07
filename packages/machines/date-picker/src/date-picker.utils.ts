import type { CalendarDate } from "@internationalized/date"

export function adjustStartAndEndDate(value: CalendarDate[]) {
  const [startDate, endDate] = value
  if (!startDate || !endDate) return value
  return startDate.compare(endDate) <= 0 ? value : [endDate, startDate]
}

export function isDateWithinRange(date: CalendarDate, value: (CalendarDate | null)[]) {
  const [startDate, endDate] = value
  if (!startDate || !endDate) return false
  return startDate.compare(date) <= 0 && endDate.compare(date) >= 0
}

export function sortDates(values: CalendarDate[]) {
  return values.sort((a, b) => a.compare(b))
}
