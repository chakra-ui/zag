import { normalizeSpan } from "./normalize-span"
import { escapeRegex } from "./escape-regex"
import type { HighlightChunk, HighlightWordProps } from "./types"

export function highlightFirst(props: HighlightWordProps): HighlightChunk[] {
  const { text, query, ignoreCase, exactMatch } = props

  if (exactMatch) {
    const escapedQuery = escapeRegex(query as string)
    const regex = new RegExp(`\\b(${escapedQuery})\\b`, ignoreCase ? "i" : "")

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

  const searchText = ignoreCase ? text.toLowerCase() : text
  const searchQuery = ignoreCase ? (typeof query === "string" ? query.toLowerCase() : query) : query

  const start = typeof searchText === "string" ? searchText.indexOf(searchQuery as string) : -1

  if (start === -1) {
    return [{ text, match: false }]
  }

  const end = start + (searchQuery as string).length
  const spans = [{ start, end }]

  return normalizeSpan(spans, text.length).map((chunk) => ({
    text: text.slice(chunk.start, chunk.end),
    match: !!chunk.match,
  }))
}
