import { Service } from "@zag-js/core"
import { highlightState } from "@zag-js/stringify-state"

type StateVisualizerProps = {
  state: Service<any>
  label?: string
  omit?: string[]
}

export function StateVisualizer(props: StateVisualizerProps) {
  const { label, omit } = props
  const service = props.state
  const obj = {
    state: service.state.get(),
    event: service.event.current(),
  }

  return (
    <div className="viz">
      <pre dir="ltr">
        <details open>
          <summary> {label || "Visualizer"} </summary>
          <div dangerouslySetInnerHTML={{ __html: highlightState(obj, omit) }} />
        </details>
      </pre>
    </div>
  )
}
