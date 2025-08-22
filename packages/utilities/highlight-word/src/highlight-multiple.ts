import { normalizeSpan } from "./normalize-span"
import { escapeRegex } from "./escape-regex"
import type { HighlightChunk, HighlightWordProps } from "./types"

const buildRegex = (queryProp: string[], flags: string, exactMatch: boolean | undefined): RegExp => {
  const query = queryProp.filter(Boolean).map((text) => escapeRegex(text))
  const pattern = exactMatch ? `\\b(${query.join("|")})\\b` : `(${query.join("|")})`

  return new RegExp(pattern, flags)
}

const getRegexFlags = (ignoreCase: boolean | undefined, matchAll = true): string =>
  `${ignoreCase ? "i" : ""}${matchAll ? "g" : ""}`

export function highlightMultiple(props: HighlightWordProps): HighlightChunk[] {
  const { text, query, ignoreCase, matchAll, exactMatch } = props

  if (query.length === 0) {
    return [{ text, match: false }]
  }

  const flags = getRegexFlags(ignoreCase, matchAll)
  const regex = buildRegex(Array.isArray(query) ? query : [query], flags, exactMatch)

  const spans = [...text.matchAll(regex)].map((match) => ({
    start: match.index || 0,
    end: (match.index || 0) + match[0].length,
  }))

  return normalizeSpan(spans, props.text.length).map((chunk) => ({
    text: props.text.slice(chunk.start, chunk.end),
    match: !!chunk.match,
  }))
}
