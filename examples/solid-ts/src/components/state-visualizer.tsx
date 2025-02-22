import type { Service } from "@zag-js/core"
import { highlightState } from "@zag-js/stringify-state"
import { createMemo } from "solid-js"

type StateVisualizerProps = {
  state: Service<any>
  label?: string
  omit?: string[]
  context?: string[]
  computed?: string[]
}

export function StateVisualizer(props: StateVisualizerProps) {
  const { state: service, label, omit, context, computed } = props
  const finalObject = createMemo(() => ({
    state: service.state.get(),
    event: service.event.current(),
    context: context ? Object.fromEntries(context.map((key) => [key, service.context.get(key)])) : undefined,
    computed: computed ? Object.fromEntries(computed.map((key) => [key, service.computed(key)])) : undefined,
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
