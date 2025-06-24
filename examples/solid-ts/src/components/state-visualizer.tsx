import type { MachineSchema, Service } from "@zag-js/core"
import { highlightState } from "@zag-js/stringify-state"
import { createMemo } from "solid-js"

interface StateVisualizerProps<T extends MachineSchema> {
  state: Service<T>
  label?: string
  omit?: string[]
  context?: Array<keyof T["context"]>
}

export function StateVisualizer<T extends MachineSchema>(props: StateVisualizerProps<T>) {
  const { state: service, label, omit, context } = props
  const finalObject = createMemo(() => ({
    state: service.state.get(),
    event: service.event.current(),
    context: context ? Object.fromEntries(context.map((key) => [key, service.context.get(key)])) : undefined,
  }))

  return (
    <div class="viz">
      <pre dir="ltr">
        <details open>
          <summary> {label || "Visualizer"} </summary>
          <div innerHTML={highlightState(finalObject(), omit)} />
        </details>
      </pre>
    </div>
  )
}
