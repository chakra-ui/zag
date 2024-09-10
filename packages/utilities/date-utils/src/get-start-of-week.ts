import { type DateValue, getDayOfWeek, startOfWeek } from "@internationalized/date"

export function getStartOfWeek(date: DateValue, locale: string, firstDayOfWeek?: number) {
  // If firstDayOfWeek is provided, use it; otherwise, use the locale's default
  if (firstDayOfWeek !== undefined) {
    // Adjust the date to the specified first day of the week
    const currentDayOfWeek = getDayOfWeek(date, locale)
    const daysToSubtract = (currentDayOfWeek - firstDayOfWeek + 7) % 7
    return date.subtract({ days: daysToSubtract })
  }

  // Use the built-in startOfWeek function for locale-specific behavior
  return startOfWeek(date, locale)
}
