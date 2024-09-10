import type { HighlightSpan } from "./types"

export const normalizeSpan = (spans: HighlightSpan[], len: number) => {
  const result: HighlightSpan[] = []
  const append = (start: number, end: number, match: boolean) => {
    if (end - start > 0) result.push({ start, end, match })
  }

  if (spans.length === 0) {
    append(0, len, false)
  } else {
    let lastIndex = 0
    for (const chunk of spans) {
      append(lastIndex, chunk.start, false)
      append(chunk.start, chunk.end, true)
      lastIndex = chunk.end
    }

    append(lastIndex, len, false)
  }

  return result
}
