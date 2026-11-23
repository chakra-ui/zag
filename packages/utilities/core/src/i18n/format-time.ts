import { cached } from "./cache"

const getDateFormat = /*#__PURE__*/ cached<Intl.DateTimeFormatOptions, typeof Intl.DateTimeFormat>(Intl.DateTimeFormat)

export type TimeFormat = "12h" | "24h"

export interface FormatTimeOptions {
  format?: TimeFormat
  amLabel?: string
  pmLabel?: string
  withSeconds?: boolean
}

function getTimeParts(value: string | Date) {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null
    return { date: value, hours: value.getHours() }
  }

  const [hours, minutes, seconds = 0] = value.split(":").map((part) => (part === "" ? NaN : Number(part)))
  if (!(hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59 && seconds >= 0 && seconds <= 59)) return null

  const date = new Date(0)
  date.setHours(hours, minutes, seconds, 0)
  return { date, hours }
}

/**
 * Formats a `Date` or a `"HH:mm"` / `"HH:mm:ss"` string as a time. Returns `null` for an invalid time.
 */
export function formatTime(value: string | Date, locale: string, options: FormatTimeOptions = {}): string | null {
  const { format = "24h", amLabel, pmLabel, withSeconds = false } = options
  const parts = getTimeParts(value)
  if (!parts) return null

  const formatter = getDateFormat(locale, {
    hour: format === "24h" ? "2-digit" : "numeric",
    minute: "2-digit",
    second: withSeconds ? "2-digit" : undefined,
    hourCycle: format === "12h" ? "h12" : "h23",
  })

  if (format !== "12h") return formatter.format(parts.date)

  const isPm = parts.hours >= 12
  return formatter
    .formatToParts(parts.date)
    .map((token: Intl.DateTimeFormatPart) => {
      if (token.type !== "dayPeriod") return token.value
      return (isPm ? pmLabel : amLabel) ?? token.value
    })
    .join("")
}
