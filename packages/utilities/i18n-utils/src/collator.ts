import { i18nCache } from "./cache"

const getCollator = i18nCache(Intl.Collator)

export function createCollator(locale: string = "en-US", options: Intl.CollatorOptions = {}) {
  return getCollator(locale, options)
}
