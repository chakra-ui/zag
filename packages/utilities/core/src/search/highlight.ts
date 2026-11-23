import type { HighlightChunk, HighlightRange, HighlightRangesProps, HighlightWordProps } from "./types"

// `\b` only knows ASCII word characters, so treat any Unicode letter, mark, number or `_` as part of a word
const WORD_CHAR = "[\\p{L}\\p{M}\\p{N}_]"

// `-` is written as `\x2d` because `\-` is a syntax error in regexes with the `u` flag
const escapeRegex = (term: string) => term.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d")

/**
 * Splits `text` into chunks, marking the given ranges as matches.
 * Ranges may be unsorted or overlap, e.g. from a fuzzy matcher.
 */
export function highlightRanges(props: HighlightRangesProps): HighlightChunk[] {
  const { text } = props

  const sorted = props.ranges
    .map(({ start, end }) => ({ start: Math.max(0, start), end: Math.min(text.length, end) }))
    .filter((range) => range.end > range.start)
    .sort((a, b) => a.start - b.start)

  const chunks: HighlightChunk[] = []
  let index = 0
  for (const range of sorted) {
    if (range.end <= index) continue
    const start = Math.max(range.start, index)
    if (start > index) chunks.push({ text: text.slice(index, start), match: false })
    const last = chunks[chunks.length - 1]
    // overlapping or adjacent ranges join the previous match
    if (last?.match && start === index) last.text += text.slice(start, range.end)
    else chunks.push({ text: text.slice(start, range.end), match: true })
    index = range.end
  }
  if (index < text.length || chunks.length === 0) chunks.push({ text: text.slice(index), match: false })
  return chunks
}

/**
 * Splits `text` into chunks, marking where `query` occurs as matches.
 * Matches the first occurrence unless `matchAll` is set, which an array query sets by default.
 */
export function highlightWord(props: HighlightWordProps): HighlightChunk[] {
  const { text, query, ignoreCase, exactMatch, matchAll = Array.isArray(query) } = props

  const terms = (Array.isArray(query) ? query : [query]).filter(Boolean).map(escapeRegex)
  if (terms.length === 0) return [{ text, match: false }]

  const pattern = terms.join("|")
  const source = exactMatch ? `(?<!${WORD_CHAR})(?:${pattern})(?!${WORD_CHAR})` : pattern
  // the `i` flag folds case per character, so match indexes line up with `text`
  const regex = new RegExp(source, `${ignoreCase ? "i" : ""}gu`)

  const ranges: HighlightRange[] = []
  for (const match of text.matchAll(regex)) {
    if (!match[0]) continue
    ranges.push({ start: match.index, end: match.index + match[0].length })
    if (!matchAll) break
  }
  return highlightRanges({ text, ranges })
}
