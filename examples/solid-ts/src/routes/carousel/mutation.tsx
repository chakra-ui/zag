import * as carousel from "@zag-js/carousel"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, Index, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/carousel.css"

export default function Page() {
  const [index, setIndex] = createSignal(0)
  const [images, setImages] = createSignal([0, 1, 2, 3, 4])

  const id = createUniqueId()
  const service = useMachine(carousel.machine, (): carousel.Props => ({
    id,
    count: images().length,
    loop: true,
    autoPlay: { delay: 1000 },
    onPageChange: ({ page }) => setIndex(page),
    page: index(),
  }))

  const api = createMemo(() => carousel.connect(service, normalizeProps))

  const onAdd = () =>
    setImages((prevImages) => {
      const max = Math.max(...prevImages)
      return [...prevImages, max + 1]
    })

  return (
    <>
      <main class="carousel">
        <div {...api().getRootProps()}>
          <div {...api().getControlProps()}>
            <button {...api().getAutoplayTriggerProps()}>
              <Show when={api().isPlaying} fallback="Play">
                Stop
              </Show>
            </button>
            <div class="carousel-spacer" />
            <button {...api().getPrevTriggerProps()}>&laquo;</button>
            <button {...api().getNextTriggerProps()}>&raquo;</button>
          </div>

          <div {...api().getIndicatorGroupProps()}>
            <Index each={api().pageSnapPoints}>
              {(_, i) => <button {...api().getIndicatorProps({ index: i })}>{i}</button>}
            </Index>
          </div>

          <div {...api().getItemGroupProps()}>
            <For each={images()}>
              {(image, index) => (
                <div {...api().getItemProps({ index: index() })}>
                  <div
                    style={{
                      width: "188px",
                      height: "188px",
                      "background-color": "#f0f0f0",
                      display: "flex",
                      "align-items": "center",
                      "justify-content": "center",
                    }}
                  >
                    Slide {image}
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>

        <p>
          <button onClick={onAdd}>add slide</button>
        </p>
      </main>

      <Toolbar>
        <StateVisualizer state={service} omit={["translations"]} />
      </Toolbar>
    </>
  )
}
