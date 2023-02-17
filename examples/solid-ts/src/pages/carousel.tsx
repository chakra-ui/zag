import * as carousel from "@zag-js/carousel"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { carouselControls, carouselData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(carouselControls)

  const [state, send] = useMachine(carousel.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => carousel.connect(state, send, normalizeProps))

  return (
    <>
      <main class="carousel">
        <div {...api().rootProps}></div>
      </main>

      <Toolbar controls={controls.ui} visualizer={<StateVisualizer state={state} />} />
    </>
  )
}
