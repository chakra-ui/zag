import { DateFormatter } from "@internationalized/date"

const cache = new Map<string, DateFormatter>()

export const getFormatter = (locale: string, options: Intl.DateTimeFormatOptions) => {
  const key = `${locale}-${JSON.stringify(options)}`
  if (!cache.has(key)) {
    const formatter = new DateFormatter(locale, options)
    cache.set(key, formatter)
  }
  return cache.get(key)!
}

export const getFormatterFn = (locale: string) => (options: Intl.DateTimeFormatOptions) => getFormatter(locale, options)
