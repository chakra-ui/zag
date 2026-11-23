import { cached } from "./cache"

const getListFormat = /*#__PURE__*/ cached<Intl.ListFormatOptions, typeof Intl.ListFormat>(Intl.ListFormat)

export function formatList(list: string[], locale: string, options: Intl.ListFormatOptions = {}): string {
  return getListFormat(locale, options).format(list)
}
