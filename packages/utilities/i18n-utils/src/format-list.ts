import { i18nCache } from "./cache"

const getListFormatter = i18nCache(Intl.ListFormat)

export function formatList(list: string[], locale: string, options: Intl.ListFormatOptions = {}) {
  const formatter = getListFormatter(locale, options)
  return formatter.format(list)
}
