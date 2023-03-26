import { CalendarDate } from "@internationalized/date"

export function formatDate(date: CalendarDate, formatString: string, locale: string, timeZone: string = "UTC") {
  const nativeDate = date.toDate(timeZone)
  return formatString
    .replace(/yyyy/gi, nativeDate.toLocaleString(locale, { year: "numeric", timeZone }))
    .replace(/yy/gi, nativeDate.toLocaleString(locale, { year: "2-digit", timeZone }))
    .replace(/dd/gi, nativeDate.toLocaleString(locale, { day: "2-digit", timeZone }))
    .replace(/d/gi, nativeDate.toLocaleString(locale, { day: "numeric", timeZone }))
    .replace(/mmmm/gi, nativeDate.toLocaleString(locale, { month: "long", timeZone }))
    .replace(/mmm/gi, nativeDate.toLocaleString(locale, { month: "short", timeZone }))
    .replace(/mm/gi, nativeDate.toLocaleString(locale, { month: "2-digit", timeZone }))
    .replace(/m/gi, nativeDate.toLocaleString(locale, { month: "numeric", timeZone }))
}
