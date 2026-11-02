import { normalizeSpan } from "./normalize-span"
import type { HighlightChunk, HighlightRangesProps, HighlightSpan } from "./types"

export function highlightRanges(props: HighlightRangesProps): HighlightChunk[] {
  const { text } = props

  // clamp, sort and merge so the spans can be split in one pass
  const spans: HighlightSpan[] = []
  const sorted = props.ranges
    .map(({ start, end }) => ({ start: Math.max(0, start), end: Math.min(text.length, end) }))
    .filter((range) => range.end > range.start)
    .sort((a, b) => a.start - b.start)

  for (const range of sorted) {
    const last = spans[spans.length - 1]
    if (last && range.start <= last.end) last.end = Math.max(last.end, range.end)
    else spans.push(range)
  }

  return normalizeSpan(spans, text.length).map((chunk) => ({
    text: text.slice(chunk.start, chunk.end),
    match: !!chunk.match,
  }))
}
