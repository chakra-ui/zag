import styles from "../../../../../shared/src/css/carousel.module.css"
import * as carousel from "@zag-js/carousel"
import { carouselControls, carouselData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, Show, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

export default function Page() {
  const controls = useControls(carouselControls)

  const service = useMachine(
    carousel.machine,
    controls.mergeProps({
      id: createUniqueId(),
      spacing: "20px",
      slidesPerPage: 2,
      slideCount: carouselData.length,
      allowMouseDrag: true,
    }),
  )

  const api = createMemo(() => carousel.connect(service, normalizeProps))

  return (
    <>
      <main class="carousel">
        <div {...api().getRootProps()} class={styles.Root}>
          <button onClick={() => api().scrollToIndex(4)}>Scroll to 4</button>
          <div {...api().getControlProps()} class={styles.Control}>
            <button {...api().getAutoplayTriggerProps()} class={styles.AutoplayTrigger}>
              <Show when={api().isPlaying} fallback="Play">
                Stop
              </Show>
            </button>
            <div class="carousel-spacer" />
            <button {...api().getPrevTriggerProps()}>Prev</button>
            <button {...api().getNextTriggerProps()}>Next</button>
          </div>
          <div {...api().getItemGroupProps()} class={styles.ItemGroup}>
            <Index each={carouselData}>
              {(image, index) => (
                <div {...api().getItemProps({ index })} class={styles.Item}>
                  <img src={image()} alt="" />
                </div>
              )}
            </Index>
          </div>

          <div {...api().getIndicatorGroupProps()} class={styles.IndicatorGroup}>
            <Index each={api().pageSnapPoints}>
              {(_, index) => <button {...api().getIndicatorProps({ index })} class={styles.Indicator} />}
            </Index>
          </div>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
