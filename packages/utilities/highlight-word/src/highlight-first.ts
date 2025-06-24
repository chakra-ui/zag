import { normalizeSpan } from "./normalize-span"
import type { HighlightChunk, HighlightWordProps } from "./types"

export function highlightFirst(props: HighlightWordProps): HighlightChunk[] {
  const { text, query, ignoreCase } = props

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
