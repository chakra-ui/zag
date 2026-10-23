export function endsWithDelimiter(str: string, delimiter: string | RegExp | undefined) {
  if (!delimiter) return false
  if (typeof delimiter === "string") return str.endsWith(delimiter)
  // group the source so `$` applies to every alternative, and keep flags like `u` and `i`
  // (`g`/`y` are dropped: `y` would anchor the match at index 0)
  return new RegExp(`(?:${delimiter.source})$`, delimiter.flags.replace(/[gy]/g, "")).test(str)
}
