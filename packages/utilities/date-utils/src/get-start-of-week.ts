import { type DateValue, getDayOfWeek } from "@internationalized/date"

export function getStartOfWeek(date: DateValue, locale: string, firstDayOfWeek: number = 0) {
  const day = getDayOfWeek(date, locale)
  const diff = (day - firstDayOfWeek + 7) % 7
  return date.subtract({ days: diff })
}
