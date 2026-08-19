const digitsCache = new Map<string, string>()

// ASCII digits plus the locale's native numerals (e.g. Arabic-Indic ٠-٩, Devanagari ०-९)
function getLocaleDigits(locale: string) {
  let digits = digitsCache.get(locale)
  if (digits != null) return digits
  const localeDigits = new Intl.NumberFormat(locale, { useGrouping: false }).format(1234567890)
  digits = "0123456789" + localeDigits
  digitsCache.set(locale, digits)
  return digits
}

const isDigit = (char: string, locale: string | undefined) => {
  return locale ? getLocaleDigits(locale).includes(char) : /\d/.test(char)
}

export const isValidCharacter = (char: string | null, separator: string, locale?: string) => {
  if (!char) return true
  if (char.length !== 1) return true // paste / IME passthrough
  return isDigit(char, locale) || separator.includes(char)
}

export const ensureValidCharacters = (value: string, separator: string, locale?: string) => {
  return value
    .split("")
    .filter((char) => isValidCharacter(char, separator, locale))
    .join("")
}

const separatorCache = new Map<string, string>()

export function getLocaleSeparator(locale: string) {
  let separator = separatorCache.get(locale)
  if (separator != null) return separator
  const parts = new Intl.DateTimeFormat(locale).formatToParts(new Date())
  const literal = parts.find((part) => part.type === "literal")
  separator = literal ? literal.value : "/"
  separatorCache.set(locale, separator)
  return separator
}
