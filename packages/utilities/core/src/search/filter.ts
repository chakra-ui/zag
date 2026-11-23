import { createCollator } from "../i18n/collator"

export interface FilterReturn {
  startsWith(string: string, substring: string): boolean
  endsWith(string: string, substring: string): boolean
  contains(string: string, substring: string): boolean
}

export interface FilterOptions extends Intl.CollatorOptions {
  locale?: string | undefined
}

/**
 * Creates locale-aware string matchers backed by `Intl.Collator`.
 * With `sensitivity: "base"`, they ignore case and accents.
 */
export function createFilter(options?: FilterOptions): FilterReturn {
  const { locale = "en-US", ...rest } = options || {}
  const collator = createCollator(locale, { usage: "search", ...rest })
  const ignorePunctuation = collator.resolvedOptions().ignorePunctuation

  function normalize(string: string) {
    string = string.normalize("NFC")
    if (ignorePunctuation) string = string.replace(/\p{P}/gu, "")
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
    // equal text always compares equal, so skip the scan on an exact hit
    if (string.includes(substring)) return true
    for (let scan = 0; scan + substring.length <= string.length; scan++) {
      if (collator.compare(substring, string.slice(scan, scan + substring.length)) === 0) return true
    }
    return false
  }

  return { startsWith, endsWith, contains }
}
