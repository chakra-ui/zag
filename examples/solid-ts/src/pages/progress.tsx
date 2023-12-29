import * as progress from "@zag-js/progress"
import { progressControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(progressControls)

  const [state, send] = useMachine(progress.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => progress.connect(state, send, normalizeProps))

  return (
    <>
      <main class="progress">
        <div {...api().rootProps}>
          <div {...api().labelProps}>Upload progress</div>
          <div {...api().trackProps}>
            <div {...api().rangeProps} />
          </div>
          <div {...api().valueTextProps}>{api().valueAsString}</div>
          <div>
            <button onClick={() => api().setValue((api().value ?? 0) - 20)}>Decrease</button>
            <button onClick={() => api().setValue((api().value ?? 0) + 20)}>Increase</button>
            <button onClick={() => api().setValue(null)}>Indeterminate</button>
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
