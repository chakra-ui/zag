import { cached } from "./cache"

const getNumberFormat = /*#__PURE__*/ cached<Intl.NumberFormatOptions, typeof Intl.NumberFormat>(Intl.NumberFormat)

export function formatNumber(v: number, locale: string, options: Intl.NumberFormatOptions = {}): string {
  return getNumberFormat(locale, options).format(v)
}
