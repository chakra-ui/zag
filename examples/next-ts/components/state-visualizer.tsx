import { Machine } from "@zag-js/core"
import { isDom } from "@zag-js/utils"
import formatHighlight from "json-format-highlight"

type StateVisualizerProps = {
  state: Record<string, any>
  label?: string
}

export function StateVisualizer(props: StateVisualizerProps) {
  const { state, label } = props

  const code = JSON.stringify(
    state,
    (_k, v) => {
      if (v instanceof Machine) {
        const id = v.state.context.uid ?? v.id
        return `Machine: ${id}`
      }
      if (isDom()) {
        if (v instanceof Document) return "doc:loaded"
        if (v instanceof HTMLElement) return v.tagName
      }
      return v
    },
    4,
  )

  const highlightedCode = formatHighlight(code, {})

  return (
    <div className="viz">
      <pre dir="ltr">
        <details open>
          <summary> {label || "Visualizer"} </summary>
          <div data-viz-content dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        </details>
      </pre>
    </div>
  )
}
