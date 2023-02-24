import { DateFormatter } from "@internationalized/date"

const formatterCache = new Map<string, DateFormatter>()

export const getFormatter = (locale: string, options: Intl.DateTimeFormatOptions) => {
  const key = `${locale}-${JSON.stringify(options)}`
  if (!formatterCache.has(key)) {
    const formatter = new DateFormatter(locale, options)
    formatterCache.set(key, formatter)
  }
  return formatterCache.get(key)!
}

export const getFormatterFn = (locale: string) => (options: Intl.DateTimeFormatOptions) => getFormatter(locale, options)
