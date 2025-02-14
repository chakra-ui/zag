import * as progress from "@zag-js/progress"
import { progressControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

export default function Page() {
  const controls = useControls(progressControls)

  const service = useMachine(progress.machine, { id: createUniqueId() })

  const api = createMemo(() => progress.connect(service, normalizeProps))

  return (
    <>
      <main class="progress">
        <div {...api().getRootProps()}>
          <div {...api().getLabelProps()}>Upload progress</div>

          <svg {...api().getCircleProps()}>
            <circle {...api().getCircleTrackProps()} />
            <circle {...api().getCircleRangeProps()} />
          </svg>

          <div {...api().getTrackProps()}>
            <div {...api().getRangeProps()} />
          </div>
          <div {...api().getValueTextProps()}>{api().valueAsString}</div>
          <div>
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
