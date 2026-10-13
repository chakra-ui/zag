import * as progress from "@zag-js/progress"
import { progressControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/progress.css"

export default function Page() {
  const controls = useControls(progressControls)

  const service = useMachine(progress.machine, controls.mergeProps<progress.Props>({ id: createUniqueId() }))

  const api = createMemo(() => progress.connect(service, normalizeProps))

  return (
    <>
      <main class="progress">
        <div class="vstack gap-4">
          <div {...api().getRootProps()}>
            <div class="progress-header">
              <span {...api().getLabelProps()}>Upload progress</span>
              <span {...api().getValueTextProps()}>{api().valueAsString}</span>
            </div>
            <div {...api().getTrackProps()}>
              <div {...api().getRangeProps()} />
            </div>
          </div>

          <div class="hstack">
            <button onClick={() => api().setValue((api().value ?? 0) - 20)}>Decrease</button>
            <button onClick={() => api().setValue((api().value ?? 0) + 20)}>Increase</button>
            <button onClick={() => api().setValue(null)}>Indeterminate</button>
          </div>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
