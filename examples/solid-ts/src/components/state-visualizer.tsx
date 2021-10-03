import { isDom } from "tiny-guard"
import { Machine } from "@ui-machines/core"

type StateVisualizerProps = {
  state: Record<string, any>
  style?: Record<string, any>
  reset?: boolean
  label?: string
}

export function StateVisualizer(props: StateVisualizerProps) {
  const { state, style, reset, label } = props
  return (
    <pre
      className="pre"
      style={
        reset
          ? style
          : {
              float: "right",
              position: "absolute",
              overflow: "hidden",
              top: "40px",
              right: "40px",
              "max-width": "240px",
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
          return isDom() && v instanceof HTMLElement ? v.tagName : v
        },
        4,
      )}
    </pre>
  )
}
