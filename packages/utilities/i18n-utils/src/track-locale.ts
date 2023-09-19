import { getWindow, isDom } from "@zag-js/dom-query"
import { getDefaultLocale, type Locale } from "./get-default-locale"
import { getLocaleDir } from "./is-rtl"

export interface LocaleOptions {
  locale?: string
  getRootNode?: () => ShadowRoot | Document
  onLocaleChange?: (locale: Locale) => void
  immediate?: boolean
}

export function trackLocale(options: LocaleOptions = {}) {
  const { locale: localeStr = "en-US", getRootNode, onLocaleChange, immediate } = options

  const fallbackLocale: Locale = {
    locale: localeStr,
    dir: getLocaleDir(localeStr),
  }

  if (immediate) {
    const locale = !isDom() ? fallbackLocale : getDefaultLocale()
    onLocaleChange?.(locale)
  }

  const handleLocaleChange = () => {
    onLocaleChange?.(getDefaultLocale())
  }

  const win = getRootNode ? getWindow(getRootNode()) : window

  win.addEventListener("languagechange", handleLocaleChange)

  return () => {
    win.removeEventListener("languagechange", handleLocaleChange)
  }
}
