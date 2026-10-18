import { normalizeSpan } from "./normalize-span"
import { escapeRegex } from "./escape-regex"
import type { HighlightChunk, HighlightWordProps } from "./types"
import { getWholeWordSpans } from "./whole-word"

const buildRegex = (queryProp: string[], flags: string): RegExp => {
  const query = queryProp.filter(Boolean).map((text) => escapeRegex(text))
  return new RegExp(`(${query.join("|")})`, flags)
}

const getRegexFlags = (ignoreCase: boolean | undefined, matchAll = true): string =>
  `${ignoreCase ? "i" : ""}${matchAll ? "g" : ""}`

export function highlightMultiple(props: HighlightWordProps): HighlightChunk[] {
  const { text, query, ignoreCase, matchAll, exactMatch } = props

  if (query.length === 0) {
    return [{ text, match: false }]
  }

  const queries = Array.isArray(query) ? query : [query]

  const spans = exactMatch
    ? getWholeWordSpans(text, queries, ignoreCase)
    : [...text.matchAll(buildRegex(queries, getRegexFlags(ignoreCase, matchAll)))].map((match) => ({
        start: match.index || 0,
        end: (match.index || 0) + match[0].length,
      }))

  return normalizeSpan(spans, props.text.length).map((chunk) => ({
    text: props.text.slice(chunk.start, chunk.end),
    match: !!chunk.match,
  }))
}
