import { i18nCache } from "./cache"

const getRelativeTimeFormatter = i18nCache(Intl.RelativeTimeFormat)

export function formatRelativeTime(value: Date, locale: string, options: Intl.RelativeTimeFormatOptions = {}) {
  const rtf = getRelativeTimeFormatter(locale, options)

  const now = new Date()
  const diff = getDistance(now, value)

  if (diff.years > 0) return rtf.format(diff.years * diff.sign, "year")
  if (diff.months > 0) return rtf.format(diff.months * diff.sign, "month")
  if (diff.weeks > 0) return rtf.format(diff.weeks * diff.sign, "week")
  if (diff.days > 0) return rtf.format(diff.days * diff.sign, "day")
  if (diff.hours > 0) return rtf.format(diff.hours * diff.sign, "hour")
  if (diff.minutes > 0) return rtf.format(diff.minutes * diff.sign, "minute")

  return rtf.format(diff.seconds * diff.sign, "second")
}

const SECOND_TO_MS = 1000
const MINUTE_TO_MS = 1000 * 60
const HOUR_TO_MS = 1000 * 60 * 60
const DAY_TO_MS = 1000 * 60 * 60 * 24
const WEEK_TO_MS = 1000 * 60 * 60 * 24 * 7
const MONTH_TO_MS = 1000 * 60 * 60 * 24 * 30
const YEAR_TO_MS = 1000 * 60 * 60 * 24 * 365

function getDistance(startDate: Date, endDate: Date) {
  const endTime = endDate.getTime()
  const startTime = startDate.getTime()
  const distance = Math.abs(endTime - startTime)

  return {
    sign: Math.sign(endTime - startTime),
    days: Math.floor(distance / DAY_TO_MS),
    hours: Math.floor((distance % DAY_TO_MS) / HOUR_TO_MS),
    minutes: Math.floor((distance % HOUR_TO_MS) / MINUTE_TO_MS),
    seconds: Math.floor((distance % MINUTE_TO_MS) / SECOND_TO_MS),
    weeks: Math.floor(distance / WEEK_TO_MS),
    months: Math.floor(distance / MONTH_TO_MS),
    years: Math.floor(distance / YEAR_TO_MS),
  }
}
