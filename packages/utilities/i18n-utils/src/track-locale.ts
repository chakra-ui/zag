import { getWindow } from "@zag-js/dom-query"
import { getDefaultLocale, type Locale } from "./get-default-locale"

export interface LocaleOptions {
  locale?: string
  getRootNode?: () => ShadowRoot | Document | Node
  onLocaleChange?: (locale: Locale) => void
}

export function trackLocale(options: LocaleOptions = {}) {
  const { getRootNode, onLocaleChange } = options

  onLocaleChange?.(getDefaultLocale())

  const handleLocaleChange = () => {
    onLocaleChange?.(getDefaultLocale())
  }

  const win = getRootNode ? getWindow(getRootNode()) : window

  win.addEventListener("languagechange", handleLocaleChange)

  return () => {
    win.removeEventListener("languagechange", handleLocaleChange)
  }
}
