import * as carousel from "@zag-js/carousel"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-solid"
import { For, Index, createMemo, createSignal, createUniqueId } from "solid-js"
import "@styles/carousel.css"

export default function Page() {
  const [slides, setSlides] = createSignal([1, 2, 3, 4])

  const id = createUniqueId()
  const service = useMachine(carousel.machine, () => ({
    id,
    count: slides().length,
    slidesPerPage: 2,
    spacing: "16px",
  }))

  const api = createMemo(() => carousel.connect(service, normalizeProps))

  return (
    <main>
      <div class="carousel">
        <div {...api().getRootProps()}>
          <div class="carousel-toolbar">
            <button onClick={() => setSlides((prev) => [...prev, Math.max(0, ...prev) + 1])}>Add slide</button>
            <button disabled={slides().length <= 1} onClick={() => setSlides((prev) => prev.slice(0, -1))}>
              Remove slide
            </button>
          </div>

          <div {...api().getControlProps()}>
            <button {...api().getPrevTriggerProps()}>
              <ChevronLeftIcon />
            </button>
            <div {...api().getItemGroupProps()}>
              <For each={slides()}>
                {(slide, index) => (
                  <div {...api().getItemProps({ index: index() })}>
                    <div class="carousel-card">{slide}</div>
                  </div>
                )}
              </For>
            </div>
            <button {...api().getNextTriggerProps()}>
              <ChevronRightIcon />
            </button>
          </div>

          <div class="carousel-footer">
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
  )
}
