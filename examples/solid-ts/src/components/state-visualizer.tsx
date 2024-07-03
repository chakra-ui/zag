import { highlightState } from "@zag-js/stringify-state"

type StateVisualizerProps = {
  state: Record<string, any>
  label?: string
  omit?: string[]
}

export function StateVisualizer(props: StateVisualizerProps) {
  const { state, label, omit } = props

  return (
    <div class="viz">
      <pre dir="ltr">
        <details open>
          <summary> {label || "Visualizer"} </summary>
          <div innerHTML={highlightState(state, omit)} />
        </details>
      </pre>
    </div>
  )
}
