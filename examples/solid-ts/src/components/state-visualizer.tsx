import { isDom } from "@ui-machines/utils"
import { Machine } from "@ui-machines/core"

type StateVisualizerProps = {
  offset?: string
  placement?: "right" | "left"
  state: Record<string, any>
  style?: Record<string, any>
  reset?: boolean
  label?: string
}

export function StateVisualizer(props: StateVisualizerProps) {
  const { state, style, reset, label, placement = "right", offset = "40px" } = props
  return (
    <pre
      className="pre"
      dir="ltr"
      style={
        reset
          ? style
          : {
              float: "right",
              position: "absolute",
              overflow: "hidden",
              top: "40px",
              [placement]: offset,
              "max-width": "320px",
              width: "100%",
              "z-index": -1,
              ...style,
            }
      }
    >
      {label && <div style={{ "margin-bottom": 24, "font-family": "monospace", "font-weight": "bold" }}>{label}</div>}
      {JSON.stringify(
        state,
        (_k, v) => {
          if (v instanceof Machine) return `Machine: ${v.state.context.uid}`
          if (v instanceof Document) return "doc:loaded"
          return isDom() && v instanceof HTMLElement ? v.tagName : v
        },
        4,
      )}
    </pre>
  )
}
