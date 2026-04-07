import * as carousel from "@zag-js/carousel"
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo, createSignal, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { Presence } from "~/components/presence"

const SLIDE_COUNT = 30

function CarouselInDialog(props: { page: number; onPageChange: (page: number) => void }) {
  const service = useMachine(carousel.machine, {
    id: createUniqueId(),
    count: SLIDE_COUNT,
    get page() {
      return props.page
    },
    onPageChange({ page }) {
      props.onPageChange(page)
    },
  })
  const api = createMemo(() => carousel.connect(service, normalizeProps))

  return (
    <div class="carousel">
      <div {...api().getRootProps()}>
        <div {...api().getControlProps()}>
          <button {...api().getPrevTriggerProps()}>Prev</button>
          <button {...api().getNextTriggerProps()}>Next</button>
        </div>

        <div {...api().getItemGroupProps()}>
          <Index each={Array.from({ length: SLIDE_COUNT })}>
            {(_, index) => (
              <div {...api().getItemProps({ index })}>
                <img
                  src={`https://picsum.photos/seed/slide-${index}/300/200`}
                  alt={`Slide ${index}`}
                  style={{ width: "100%" }}
                />
              </div>
            )}
          </Index>
        </div>

        <div {...api().getIndicatorGroupProps()}>
          <Index each={api().pageSnapPoints}>{(_, index) => <button {...api().getIndicatorProps({ index })} />}</Index>
        </div>

        <p data-testid="page-display">Current page: {api().page}</p>
      </div>
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
        Open Carousel in Dialog
      </button>

      <Portal>
        <Presence {...api().getBackdropProps()} />
        <div {...api().getPositionerProps()}>
          <Presence {...api().getContentProps()}>
            <h2 {...api().getTitleProps()}>Carousel in Dialog</h2>
            <p {...api().getDescriptionProps()}>Navigate past page 10 to test the fix.</p>
            <CarouselInDialog page={page()} onPageChange={setPage} />
            <button {...api().getCloseTriggerProps()} data-testid="close-dialog">
              Close
            </button>
          </Presence>
        </div>
      </Portal>
    </main>
  )
}
