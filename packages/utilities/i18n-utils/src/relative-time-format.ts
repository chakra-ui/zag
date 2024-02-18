import { i18nCache } from "./i18n-cache"

const getRelativeTimeFormatter = i18nCache(Intl.RelativeTimeFormat)

export function formatRelativeTime(
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  locale: string,
  options: Intl.RelativeTimeFormatOptions = {},
) {
  const formatter = getRelativeTimeFormatter(locale, options)
  return formatter.format(value, unit)
}
