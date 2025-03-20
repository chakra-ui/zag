import { i18nCache } from "./cache"

export interface FilterReturn {
  startsWith(string: string, substring: string): boolean
  endsWith(string: string, substring: string): boolean
  contains(string: string, substring: string): boolean
}

export interface FilterOptions extends Intl.CollatorOptions {
  locale?: string | undefined
}

const collatorCache = i18nCache(Intl.Collator)

export function createFilter(options?: FilterOptions): FilterReturn {
  const { locale, ...rest } = options || {}
  const collator = collatorCache(locale || "en-US", { usage: "search", ...rest })

  function normalize(string: string) {
    string = string.normalize("NFC")
    if (collator.resolvedOptions().ignorePunctuation) {
      string = string.replace(/\p{P}/gu, "")
    }
    return string
  }

  function startsWith(string: string, substring: string) {
    if (substring.length === 0) return true
    string = normalize(string)
    substring = normalize(substring)
    return collator.compare(string.slice(0, substring.length), substring) === 0
  }

  function endsWith(string: string, substring: string) {
    if (substring.length === 0) return true
    string = normalize(string)
    substring = normalize(substring)
    return collator.compare(string.slice(-substring.length), substring) === 0
  }

  function contains(string: string, substring: string) {
    if (substring.length === 0) return true
    string = normalize(string)
    substring = normalize(substring)
    let scan = 0
    let sliceLen = substring.length
    for (; scan + sliceLen <= string.length; scan++) {
      let slice = string.slice(scan, scan + sliceLen)
      if (collator.compare(substring, slice) === 0) {
        return true
      }
    }
    return false
  }

  return {
    startsWith,
    endsWith,
    contains,
  }
}
