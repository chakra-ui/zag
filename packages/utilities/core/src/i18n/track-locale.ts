import { getDefaultLocale } from "./locale"
import type { Locale } from "./locale"

export interface LocaleOptions {
  locale?: string | undefined
  getRootNode?: (() => ShadowRoot | Document | Node) | undefined
  onLocaleChange?: ((locale: Locale) => void) | undefined
}

export function trackLocale(options: LocaleOptions = {}) {
  const { getRootNode, onLocaleChange } = options

  onLocaleChange?.(getDefaultLocale())

  const handleLocaleChange = () => {
    onLocaleChange?.(getDefaultLocale())
  }

  const node = getRootNode?.()
  const doc = node?.nodeType === 9 ? (node as Document) : node?.ownerDocument
  const win = doc?.defaultView ?? window

  win.addEventListener("languagechange", handleLocaleChange)

  return () => {
    win.removeEventListener("languagechange", handleLocaleChange)
  }
}
