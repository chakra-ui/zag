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
        maxWidth: "240px",
        width: "100%",
        zIndex: -1,
        ...style,
      }}
    >
      {JSON.stringify(
        state,
        (key, value) => {
          if (value instanceof Document) return "doc:loaded"
          return isDom() && value instanceof HTMLElement ? value.tagName : value
        },
        4,
      )}
    </pre>
  )
}
