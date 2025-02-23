import { Service } from "@zag-js/core"
import { highlightState } from "@zag-js/stringify-state"

type StateVisualizerProps = {
  state: Service<any>
  label?: string
  omit?: string[]
  context?: string[]
  computed?: string[]
}

export function StateVisualizer(props: StateVisualizerProps) {
  const { label, omit, context, computed } = props
  const service = props.state
  const obj = {
    state: service.state.get(),
    event: service.event.current(),
    previousEvent: service.event.previous(),
    context: context ? Object.fromEntries(context.map((key) => [key, service.context.get(key)])) : undefined,
    computed: computed ? Object.fromEntries(computed.map((key) => [key, service.computed(key)])) : undefined,
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
