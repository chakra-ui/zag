import { highlightState } from "@zag-js/stringify-state"

interface StateVisualizerProps {
  state: Record<string, any>
  label?: string
  omit?: string[]
}

export function StateVisualizer(props: StateVisualizerProps) {
  const { state, label, omit } = props

  return (
    <div className="viz">
      <pre dir="ltr">
        <details open>
          <summary> {label || "Visualizer"} </summary>
          <div dangerouslySetInnerHTML={{ __html: highlightState(state, omit) }} />
        </details>
      </pre>
    </div>
  )
}
