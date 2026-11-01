import * as carousel from "@zag-js/carousel"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-solid"
import { Index, createMemo, createUniqueId } from "solid-js"
import "@styles/carousel.css"

const photos = [
  { width: 300, height: 400 },
  { width: 600, height: 400 },
  { width: 400, height: 400 },
  { width: 320, height: 400 },
  { width: 640, height: 400 },
  { width: 400, height: 400 },
  { width: 300, height: 400 },
].map((size, index) => ({ ...size, src: `https://picsum.photos/seed/zag-strip-${index}/${size.width}/${size.height}` }))

export default function Page() {
  const photoService = useMachine(carousel.machine, {
    id: createUniqueId(),
    count: photos.length,
    autoSize: true,
    spacing: "8px",
    allowMouseDrag: true,
  })
  const photoApi = createMemo(() => carousel.connect(photoService, normalizeProps))

  return (
    <main>
      <div class="carousel">
        <div {...photoApi().getRootProps()} class="carousel-strip">
          <div {...photoApi().getControlProps()}>
            <button {...photoApi().getPreviousTriggerProps()}>
              <ChevronLeftIcon />
            </button>
            <div {...photoApi().getItemGroupProps()}>
              <Index each={photos}>
                {(photo, index) => (
                  <div {...photoApi().getItemProps({ index })}>
                    <img src={photo().src} width={photo().width} height={photo().height} alt="" />
                  </div>
                )}
              </Index>
            </div>
            <button {...photoApi().getNextTriggerProps()}>
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
