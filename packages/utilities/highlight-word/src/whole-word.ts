import { escapeRegex } from "./escape-regex"
import type { HighlightSpan } from "./types"

// `\b` only knows ASCII word characters, so it can't tell where a Korean, Cyrillic or accented word starts or ends.
// Treat any letter, combining mark, number or underscore next to a match as part of the same word.
const WORD_CHAR = "[\\p{L}\\p{M}\\p{N}_]"
const WORD_CHAR_AT_END = new RegExp(`${WORD_CHAR}$`, "u")

/**
 * Returns the spans of `query` in `text` that are whole words.
 */
export function getWholeWordSpans(
  text: string,
  query: string[],
  ignoreCase: boolean | undefined,
  limit = Infinity,
): HighlightSpan[] {
  const pattern = query.filter(Boolean).map(escapeRegex).join("|")
  if (!pattern) return []

  // the lookahead lets the regex fall back to another query when one runs into a longer word
  const regex = new RegExp(`(?:${pattern})(?!${WORD_CHAR})`, ignoreCase ? "giu" : "gu")
  const spans: HighlightSpan[] = []
  let match: RegExpExecArray | null

  while (spans.length < limit && (match = regex.exec(text))) {
    const start = match.index
    const end = start + match[0].length

    // checked here rather than with a lookbehind, which older Safari versions can't parse
    if (end > start && !WORD_CHAR_AT_END.test(text.slice(Math.max(0, start - 2), start))) {
      spans.push({ start, end })
    } else {
      regex.lastIndex = start + 1
    }
  }

  return spans
}
