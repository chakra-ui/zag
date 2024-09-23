import { highlightState } from "@zag-js/stringify-state"
import { component$ } from "@builder.io/qwik"

type StateVisualizerProps = {
  state: Record<string, any>
  label?: string
  omit?: string[]
}

export default component$<StateVisualizerProps>((props) => {
  const { state, label, omit } = props

  return (
    <div class="viz">
      <details open>
        <summary> {label || "Visualizer"} </summary>
        <pre dir="ltr" dangerouslySetInnerHTML={highlightState(state, omit)} />
      </details>
    </div>
  )
})
