import { Machine } from "@ui-machines/core"
import { isDom } from "@ui-machines/utils"

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
              top: 40,
              right: 40,
              maxWidth: 400,
              width: "100%",
              zIndex: -1,
              ...style,
            }
      }
    >
      {label && <div style={{ marginBottom: 24, fontFamily: "monospace", fontWeight: "bold" }}>{label}</div>}
      {JSON.stringify(
        state,
        (_k, v) => {
          if (v instanceof Machine) {
            const id = v.state.context.uid ?? v.id
            return `Machine: ${id}`
          }
          return isDom() && v instanceof HTMLElement ? v.tagName : v
        },
        4,
      )}
    </pre>
  )
}
