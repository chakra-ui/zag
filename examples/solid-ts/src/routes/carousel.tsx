import * as carousel from "@zag-js/carousel"
import { carouselControls, carouselData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

export default function Page() {
  const controls = useControls(carouselControls)

  const [state, send] = useMachine(carousel.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => carousel.connect(state, send, normalizeProps))

  return (
    <>
      <main class="carousel">
        <div {...api().getRootProps()}>
          <button {...api().getPrevTriggerProps()}>Prev</button>
          <button {...api().getNextTriggerProps()}>Next</button>
          <div {...api().getViewportProps()}>
            <div {...api().getItemGroupProps()}>
              <For each={carouselData}>
                {(image, index) => (
                  <div {...api().getItemProps({ index: index() })}>
                    <img src={image} alt="" style={{ height: "300px", width: "100%", "object-fit": "cover" }} />
                  </div>
                )}
              </For>
            </div>
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
