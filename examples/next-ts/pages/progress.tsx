import * as progress from "@zag-js/progress"
import { normalizeProps, useMachine } from "@zag-js/react"
import { progressControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(progressControls)

  const [state, send] = useMachine(progress.machine({ id: useId() }), {
    context: controls.context,
  })

  const api = progress.connect(state, send, normalizeProps)

  return (
    <>
      <main className="progress">
        <div {...api.getRootProps()}>
          <div {...api.getLabelProps()}>Upload progress</div>

          <svg {...api.getCircleProps()}>
            <circle {...api.getCircleTrackProps()} />
            <circle {...api.getCircleRangeProps()} />
          </svg>

          <div {...api.getTrackProps()}>
            <div {...api.getRangeProps()} />
          </div>

          <div {...api.getValueTextProps()}>{api.valueAsString}</div>

          <div>
            <button onClick={() => api.setValue((api.value ?? 0) - 20)}>Decrease</button>
            <button onClick={() => api.setValue((api.value ?? 0) + 20)}>Increase</button>
            <button onClick={() => api.setValue(null)}>Indeterminate</button>
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
