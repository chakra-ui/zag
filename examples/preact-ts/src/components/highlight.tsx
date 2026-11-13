import { getFuzzyMatchRanges } from "@zag-js/fuzzy"
import { highlightRanges, highlightWord } from "@zag-js/highlight-word"
import { useMemo } from "preact/hooks"

interface HighlightProps {
  text: string
  query: string
  fuzzy?: boolean
}

export function Highlight(props: HighlightProps) {
  const { text, query, fuzzy } = props
  const chunks = useMemo(
    () =>
      fuzzy
        ? highlightRanges({ text, ranges: getFuzzyMatchRanges(text, query) })
        : highlightWord({ text, query, ignoreCase: true, matchAll: true }),
    [text, query, fuzzy],
  )
  return <span>{chunks.map((chunk, index) => (chunk.match ? <mark key={index}>{chunk.text}</mark> : chunk.text))}</span>
}
