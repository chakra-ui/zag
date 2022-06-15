import { stringifyState } from "@zag-js/shared"

type StateVisualizerProps = {
  state: Record<string, any>
  label?: string
}

export function StateVisualizer(props: StateVisualizerProps) {
  const { state, label } = props

  return (
    <div className="viz">
      <pre dir="ltr">
        <details open>
          <summary> {label || "Visualizer"} </summary>
          <div dangerouslySetInnerHTML={{ __html: stringifyState(state) }} />
        </details>
      </pre>
    </div>
  )
}
