export const isValidCharacter = (char: string | null, separator: string) => {
  if (!char) return true
  return /\d/.test(char) || char === separator || char.length !== 1
}

export function getLocaleSeparator(locale: string) {
  const dateFormatter = new Intl.DateTimeFormat(locale)
  const parts = dateFormatter.formatToParts(new Date())
  const literalPart = parts.find((part) => part.type === "literal")
  return literalPart ? literalPart.value : "/"
}
