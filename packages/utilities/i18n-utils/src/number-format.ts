import { i18nCache } from "./cache"

const getNumberFormatter = i18nCache(Intl.NumberFormat)

export function formatNumber(v: number, locale: string, options: Intl.NumberFormatOptions = {}) {
  const formatter = getNumberFormatter(locale, options)
  return formatter.format(v)
}
