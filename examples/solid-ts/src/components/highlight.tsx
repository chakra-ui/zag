import { getFuzzyMatchRanges } from "@zag-js/fuzzy"
import { highlightRanges, highlightWord } from "@zag-js/highlight-word"
import { For, createMemo } from "solid-js"

interface HighlightProps {
  text: string
  query: string
  fuzzy?: boolean
}

export function Highlight(props: HighlightProps) {
  const chunks = createMemo(() =>
    props.fuzzy
      ? highlightRanges({ text: props.text, ranges: getFuzzyMatchRanges(props.text, props.query) })
      : highlightWord({ text: props.text, query: props.query, ignoreCase: true, matchAll: true }),
  )
  return (
    <span>
      <For each={chunks()}>{(chunk) => (chunk.match ? <mark>{chunk.text}</mark> : chunk.text)}</For>
    </span>
  )
}
