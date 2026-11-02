import { getFuzzyMatchRanges } from "@zag-js/fuzzy"
import { highlightRanges } from "@zag-js/highlight-word"
import { For, createMemo } from "solid-js"

interface HighlightProps {
  text: string
  query: string
}

export function Highlight(props: HighlightProps) {
  const chunks = createMemo(() =>
    highlightRanges({ text: props.text, ranges: getFuzzyMatchRanges(props.text, props.query) }),
  )
  return (
    <span>
      <For each={chunks()}>{(chunk) => (chunk.match ? <mark>{chunk.text}</mark> : chunk.text)}</For>
    </span>
  )
}
