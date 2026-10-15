import * as carousel from "@zag-js/carousel"
import { carouselControls, carouselData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from "lucide-solid"
import { Index, Show, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/carousel.css"

export default function Page() {
  const controls = useControls(carouselControls)

  const service = useMachine(
    carousel.machine,
    controls.mergeProps({
      id: createUniqueId(),
      spacing: "16px",
      slidesPerPage: 2,
      count: carouselData.length,
      allowMouseDrag: true,
    }),
  )

  const api = createMemo(() => carousel.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div class="carousel">
          <div {...api().getRootProps()}>
            <div class="carousel-toolbar">
              <button onClick={() => api().scrollToIndex(4)}>Scroll to 4</button>
            </div>

            <div {...api().getControlProps()}>
              <button {...api().getPreviousTriggerProps()}>
                <ChevronLeftIcon />
              </button>
              <div {...api().getItemGroupProps()}>
                <Index each={carouselData}>
                  {(image, index) => (
                    <div {...api().getItemProps({ index })} class="carousel-photo">
                      <img src={image()} alt="" />
                    </div>
                  )}
                </Index>
              </div>
              <button {...api().getNextTriggerProps()}>
                <ChevronRightIcon />
              </button>
            </div>

            <div class="carousel-footer">
              <button {...api().getAutoplayTriggerProps()}>
                <Show when={api().isPlaying} fallback={<PlayIcon />}>
                  <PauseIcon />
                </Show>
                <span class="sr-only">{api().isPlaying ? "Stop" : "Play"}</span>
              </button>
              <div {...api().getIndicatorGroupProps()}>
                <Index each={api().pageSnapPoints}>
                  {(_, index) => <button {...api().getIndicatorProps({ index })} />}
                </Index>
              </div>
              <span {...api().getProgressTextProps()}>{api().getProgressText()}</span>
            </div>
          </div>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} omit={["translations"]} />
      </Toolbar>
    </>
  )
}
