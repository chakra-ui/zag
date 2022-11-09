import { stringifyState } from "@zag-js/shared"
import { isRef } from "vue"

type StateVisualizerProps = {
  state: Record<string, any>
  label?: string
  omit?: string[]
}

export function StateVisualizer(props: StateVisualizerProps) {
  const { state: _state, label, omit } = props
  const state = isRef(_state) ? _state.value : _state

  return (
    <div class="viz">
      <pre>
        <details open>
          <summary> {label || "Visualizer"} </summary>
          <div innerHTML={stringifyState(state as any, omit)} />
        </details>
      </pre>
    </div>
  )
}
