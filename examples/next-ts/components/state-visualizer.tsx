import { Machine } from "@zag-js/core"
import { isDom } from "@zag-js/utils"
import formatHighlight from "json-format-highlight"

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
      <pre
        dir="ltr"
        style={
          reset
            ? style
            : {
                float: "right",
                position: "absolute",
                overflow: "hidden",
                top: 40,
                [placement]: offset,
                maxWidth: "320px",
                width: "100%",
                zIndex: -1,
                ...style,
              }
        }
      >
        {label && <div style={{ marginBottom: 24, fontFamily: "monospace", fontWeight: "bold" }}>{label}</div>}
        <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
      </pre>
    </div>
  )
}
