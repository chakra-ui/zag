import { getFuzzyMatchRanges } from "@zag-js/fuzzy"
import { highlightRanges } from "@zag-js/highlight-word"

interface HighlightProps {
  text: string
  query: string
}

export function Highlight(props: HighlightProps) {
  const chunks = highlightRanges({ text: props.text, ranges: getFuzzyMatchRanges(props.text, props.query) })
  return <span>{chunks.map((chunk, index) => (chunk.match ? <mark key={index}>{chunk.text}</mark> : chunk.text))}</span>
}
