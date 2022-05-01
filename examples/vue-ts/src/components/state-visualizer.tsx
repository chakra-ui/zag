import { Machine } from "@zag-js/core"
import { isDom } from "@zag-js/utils"
import { h, isRef, SetupContext } from "vue"
import formatHighlight from "json-format-highlight"

type StateVisualizerProps = {
  state: Record<string, any>
  label?: string
}

export function StateVisualizer(props: StateVisualizerProps, { attrs }: SetupContext) {
  const { state: _state, label } = props
  const state = isRef(_state) ? _state.value : _state

  const code = JSON.stringify(
    state,
    (k, v) => {
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
  const codeHtml = h("div", { innerHTML: highlightedCode })

  return (
    <div class="viz">
      <pre>
        <details open>
          <summary> {label || "Visualizer"} </summary>
          {codeHtml}
        </details>
      </pre>
    </div>
  )
}
