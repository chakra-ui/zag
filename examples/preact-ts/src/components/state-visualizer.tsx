import { MachineSchema, Service } from "@zag-js/core"
import { highlightState } from "@zag-js/stringify-state"

type StateVisualizerProps<T extends MachineSchema> = {
  state: Service<T>
  label?: string
  omit?: string[]
  context?: Array<keyof T["context"]>
}

export function StateVisualizer<T extends MachineSchema>(props: StateVisualizerProps<T>) {
  const { label, omit, context } = props
  const service = props.state
  const obj = {
    state: service.state.get(),
    event: service.event.current(),
    previousEvent: service.event.previous(),
    context: context ? Object.fromEntries(context.map((key) => [key, service.context.get(key)])) : undefined,
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
