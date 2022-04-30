import { isDom } from "@zag-js/utils"
import { Machine } from "@zag-js/core"
import formatHighlight from "json-format-highlight"

type StateVisualizerProps = {
  state: Record<string, any>
  label?: string
}

export function StateVisualizer(props: StateVisualizerProps) {
  const { state, label } = props

  return (
    <div className="viz">
      <pre dir="ltr">
        <details open>
          <summary> {label || "Visualizer"} </summary>

          <div
            innerHTML={formatHighlight(
              JSON.stringify(
                state,
                (_k, v) => {
                  if (v instanceof Machine) {
                    const id = v.state.context.uid ?? v.id
                    return `Machine: ${id}`
                  }
                  if (v instanceof Document) return "doc:loaded"
                  return isDom() && v instanceof HTMLElement ? v.tagName : v
                },
                4,
              ),
            )}
          />
        </details>
      </pre>
    </div>
  )
}
