import { cached } from "./cache"

const getRelativeTimeFormat = /*#__PURE__*/ cached<Intl.RelativeTimeFormatOptions, typeof Intl.RelativeTimeFormat>(
  Intl.RelativeTimeFormat,
)

const SECOND_MS = 1000
const MINUTE_MS = SECOND_MS * 60
const HOUR_MS = MINUTE_MS * 60
const DAY_MS = HOUR_MS * 24

// longest unit first; months and years are approximate
const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", DAY_MS * 365],
  ["month", DAY_MS * 30],
  ["week", DAY_MS * 7],
  ["day", DAY_MS],
  ["hour", HOUR_MS],
  ["minute", MINUTE_MS],
]

export function formatRelativeTime(value: Date, locale: string, options: Intl.RelativeTimeFormatOptions = {}): string {
  const rtf = getRelativeTimeFormat(locale, options)
  const diff = value.getTime() - Date.now()
  const distance = Math.abs(diff)
  const sign = Math.sign(diff)

  for (const [unit, ms] of RELATIVE_UNITS) {
    const amount = Math.floor(distance / ms)
    if (amount > 0) return rtf.format(amount * sign, unit)
  }
  return rtf.format(Math.floor(distance / SECOND_MS) * sign, "second")
}
