import * as carousel from "@zag-js/carousel"
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-solid"
import { Index, createMemo, createSignal, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { Presence } from "~/components/presence"
import "@styles/carousel.css"
import "@styles/dialog.css"

const images = Array.from({ length: 12 }, (_, index) => `https://picsum.photos/seed/zag-product-${index}/800/500`)

function Lightbox(props: { page: number; onPageChange: (page: number) => void }) {
  const service = useMachine(carousel.machine, {
    id: createUniqueId(),
    count: images.length,
    get page() {
      return props.page
    },
    onPageChange: (details) => props.onPageChange(details.page),
  })
  const api = createMemo(() => carousel.connect(service, normalizeProps))

  return (
    <div {...api().getRootProps()}>
      <div {...api().getControlProps()}>
        <button {...api().getPrevTriggerProps()}>
          <ChevronLeftIcon />
        </button>
        <div {...api().getItemGroupProps()}>
          <Index each={images}>
            {(src, index) => (
              <div {...api().getItemProps({ index })} class="carousel-photo">
                <img src={src()} alt={`Product image ${index + 1}`} />
              </div>
            )}
          </Index>
        </div>
        <button {...api().getNextTriggerProps()}>
          <ChevronRightIcon />
        </button>
      </div>
      <span {...api().getProgressTextProps()} data-testid="page-display">
        {api().getProgressText()}
      </span>
    </div>
  )
}

export default function Page() {
  const [page, setPage] = createSignal(0)

  const service = useMachine(dialog.machine, { id: createUniqueId() })
  const api = createMemo(() => dialog.connect(service, normalizeProps))

  return (
    <main>
      <button {...api().getTriggerProps()} data-testid="open-dialog">
        View product images
      </button>

      <Portal>
        <Presence {...api().getBackdropProps()} />
        <div {...api().getPositionerProps()}>
          <Presence {...api().getContentProps()} class="carousel">
            <h2 {...api().getTitleProps()}>Product images</h2>
            <p {...api().getDescriptionProps()}>Use the arrows or swipe to browse.</p>
            <Lightbox page={page()} onPageChange={setPage} />
            <button {...api().getCloseTriggerProps()} data-testid="close-dialog">
              <XIcon />
            </button>
          </Presence>
        </div>
      </Portal>
    </main>
  )
}
