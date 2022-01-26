import { Machine } from "@ui-machines/core"
import { isDom } from "@ui-machines/utils"

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
      dir="ltr"
      className="pre"
      style={
        reset
          ? style
          : {
              float: "right",
              position: "absolute",
              overflow: "hidden",
              top: 40,
              [placement]: offset,
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
