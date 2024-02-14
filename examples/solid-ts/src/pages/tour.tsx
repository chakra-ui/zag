import * as tour from "@zag-js/tour"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { tourControls, tourData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(tourControls)

  const [state, send] = useMachine(tour.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => tour.connect(state, send, normalizeProps))

  return (
    <>
      <main class="tour">
        <div {...api().rootProps}></div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
