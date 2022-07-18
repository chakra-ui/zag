import { stringifyState } from "@zag-js/shared"
import { isRef } from "vue"

type StateVisualizerProps = {
  state: Record<string, any>
  label?: string
}

export function StateVisualizer(props: StateVisualizerProps) {
  const { state: _state, label } = props
  const state = isRef(_state) ? _state.value : _state

  return (
    <div class="viz">
      <pre>
        <details open>
          <summary> {label || "Visualizer"} </summary>
          <div innerHTML={stringifyState(state as any)} />
        </details>
      </pre>
    </div>
  )
}
