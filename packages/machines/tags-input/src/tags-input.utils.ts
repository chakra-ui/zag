/** The value without its trailing delimiter, or `undefined` if it doesn't end with one */
export function trimTrailingDelimiter(value: string, delimiter: string | RegExp | undefined) {
  if (!delimiter) return
  if (typeof delimiter === "string") {
    return value.endsWith(delimiter) ? value.slice(0, -delimiter.length) : undefined
  }
  const regex = new RegExp(`(?:${delimiter.source})$`, delimiter.flags.replace(/[gy]/g, ""))
  const match = regex.exec(value)
  if (!match?.[0]) return
  return value.slice(0, match.index)
}
