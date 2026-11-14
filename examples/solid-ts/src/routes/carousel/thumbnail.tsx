import * as carousel from "@zag-js/carousel"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-solid"
import { For, createMemo, createUniqueId } from "solid-js"
import "@styles/carousel.css"

const images = Array.from({ length: 8 }, (_, index) => `https://picsum.photos/seed/zag-gallery-${index}/800/500`)

export default function Page() {
  const mainService = useMachine(carousel.machine, {
    id: createUniqueId(),
    count: images.length,
    slidesPerPage: 1,
    onPageChange: (details) => thumbnails().scrollToIndex(details.page),
  })
  const main = createMemo(() => carousel.connect(mainService, normalizeProps))

  const thumbnailService = useMachine(carousel.machine, {
    id: createUniqueId(),
    count: images.length,
    // The cut-off sixth thumbnail shows the strip scrolls
    slidesPerPage: 5.5,
    spacing: "8px",
  })
  const thumbnails = createMemo(() => carousel.connect(thumbnailService, normalizeProps))

  return (
    <main>
      <div class="carousel">
        <div {...main().getRootProps()}>
          <div {...main().getControlProps()}>
            <button {...main().getPreviousTriggerProps()}>
              <ChevronLeftIcon />
            </button>
            <div {...main().getItemGroupProps()}>
              <For keyed={false} each={images}>
                {(src, index) => (
                  <div {...main().getItemProps({ index })} class="carousel-photo">
                    <img src={src()} alt={`Gallery item ${index + 1}`} />
                  </div>
                )}
              </For>
            </div>
            <button {...main().getNextTriggerProps()}>
              <ChevronRightIcon />
            </button>
          </div>

          <div {...thumbnails().getRootProps()} class="carousel-thumbnails">
            <div {...thumbnails().getItemGroupProps()}>
              <For keyed={false} each={images}>
                {(src, index) => (
                  <div
                    {...thumbnails().getItemProps({ index })}
                    data-selected={main().page === index || undefined}
                    onClick={() => main().scrollToIndex(index)}
                  >
                    <img src={src()} alt="" />
                  </div>
                )}
              </For>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
