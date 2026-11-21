import { normalizeSpan } from "./normalize-span"
import { escapeRegex } from "./escape-regex"
import type { HighlightChunk, HighlightWordProps } from "./types"
import { wholeWord } from "./whole-word"

export function highlightFirst(props: HighlightWordProps): HighlightChunk[] {
  const { text, query, ignoreCase, exactMatch } = props

  if (exactMatch) {
    const escapedQuery = escapeRegex(query as string)
    const regex = new RegExp(wholeWord(escapedQuery), ignoreCase ? "iu" : "u")

    const match = text.match(regex)
    if (!match || match.index === undefined) {
      return [{ text, match: false }]
    }

    const start = match.index
    const end = start + match[0].length
    const spans = [{ start, end }]

    return normalizeSpan(spans, text.length).map((chunk) => ({
      text: text.slice(chunk.start, chunk.end),
      match: !!chunk.match,
    }))
  }

  // match on the text itself: lowercasing it first can change its length ("İ" becomes "i̇"),
  // and then an index found in the lowercased text points at the wrong characters
  const regex = new RegExp(escapeRegex(query as string), ignoreCase ? "iu" : "u")

  const match = text.match(regex)
  if (!match || match.index === undefined) {
    return [{ text, match: false }]
  }

  const start = match.index
  const end = start + match[0].length
  const spans = [{ start, end }]

  return normalizeSpan(spans, text.length).map((chunk) => ({
    text: text.slice(chunk.start, chunk.end),
    match: !!chunk.match,
  }))
}
