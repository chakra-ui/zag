import { Machine } from "@ui-machines/core"
import { isDom } from "@ui-machines/utils"
import { h, isRef, SetupContext } from "vue"

type StateVisualizerProps = {
  offset?: string
  placement?: "right" | "left"
  state: Record<string, any>
  style?: Record<string, any>
  reset?: boolean
  label?: string
}

export function StateVisualizer(props: StateVisualizerProps, { attrs }: SetupContext) {
  const { state: _state, placement = "right", offset = "40px", style } = props
  const state = isRef(_state) ? _state.value : _state
  return (
    <pre
      class="pre"
      {...attrs}
      style={{
        float: "right",
        position: "absolute",
        overflow: "hidden",
        top: "40px",
        [placement]: offset,
        maxWidth: "320px",
        width: "100%",
        zIndex: -1,
        ...style,
      }}
    >
      {JSON.stringify(
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
      )}
    </pre>
  )
}
