import { highlightState } from "@zag-js/stringify-state"
import type { MachineSchema, Service } from "@zag-js/core"
import { useMemo } from "preact/hooks"

interface StateVisualizerProps<T extends MachineSchema> {
  state: Service<T>
  label?: string
  omit?: string[]
  context?: Array<keyof T["context"]>
}

export function StateVisualizer<T extends MachineSchema>(props: StateVisualizerProps<T>) {
  const { state, label, omit, context } = props
  const finalObject = useMemo(
    () => ({
      state: state.state.get(),
      event: state.event.current(),
      context: context ? Object.fromEntries(context.map((key) => [key, state.context.get(key)])) : undefined,
    }),
    [state, context],
  )

  return (
    <div className="viz">
      <pre dir="ltr">
        <details open>
          <summary> {label || "Visualizer"} </summary>
          <div dangerouslySetInnerHTML={{ __html: highlightState(finalObject, omit) }} />
        </details>
      </pre>
    </div>
  )
}
