export const isValidCharacter = (char: string | null, separator: string) => {
  if (!char) return true
  return /\d/.test(char) || separator.includes(char) || char.length !== 1
}

export const ensureValidCharacters = (value: string, separator: string) => {
  return value
    .split("")
    .filter((char) => isValidCharacter(char, separator))
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
