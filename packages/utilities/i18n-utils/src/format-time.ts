import { i18nCache } from "./cache"

export type TimeFormat = "12h" | "24h"

export interface AmPmLabels {
  am: string
  pm: string
}

export interface FormatTimeOptions {
  format?: TimeFormat
  amPmLabels?: AmPmLabels
  withSeconds?: boolean
}

const getTimeFormatter = i18nCache(Intl.DateTimeFormat)

function splitTimeString(timeString: string) {
  const [hours = null, minutes = null, seconds = null] = timeString.split(":")
  const parsedHours = hours === null ? null : Number(hours)
  const parsedMinutes = minutes === null ? null : Number(minutes)
  const parsedSeconds = seconds === null ? null : Number(seconds)

  return {
    hours: Number.isNaN(parsedHours) ? null : parsedHours,
    minutes: Number.isNaN(parsedMinutes) ? null : parsedMinutes,
    seconds: Number.isNaN(parsedSeconds) ? null : parsedSeconds,
  }
}

function getTimeParts(value: string | Date) {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null
    return {
      date: value,
      hours: value.getHours(),
      minutes: value.getMinutes(),
      seconds: value.getSeconds(),
    }
  }

  const { hours, minutes, seconds } = splitTimeString(value)

  if (hours === null || minutes === null) return null
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null
  if (seconds !== null && (seconds < 0 || seconds > 59)) return null

  const date = new Date(0)
  date.setHours(hours, minutes, seconds ?? 0, 0)

  return { date, hours, minutes, seconds: seconds ?? 0 }
}

export function formatTime(value: string | Date, locale: string, options: FormatTimeOptions = {}) {
  const { format = "24h", amPmLabels, withSeconds = false } = options
  const parts = getTimeParts(value)
  if (!parts) return null

  const formatter = getTimeFormatter(locale, {
    hour: format === "24h" ? "2-digit" : "numeric",
    minute: "2-digit",
    second: withSeconds ? "2-digit" : undefined,
    hour12: format === "12h",
  })

  if (format !== "12h" || !amPmLabels) {
    return formatter.format(parts.date)
  }

  const isPm = parts.hours >= 12
  const tokens = formatter.formatToParts(parts.date)
  return tokens
    .map((token) => (token.type === "dayPeriod" ? (isPm ? amPmLabels.pm : amPmLabels.am) : token.value))
    .join("")
}
