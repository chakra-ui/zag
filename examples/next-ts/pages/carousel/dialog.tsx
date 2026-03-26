import * as carousel from "@zag-js/carousel"
import * as dialog from "@zag-js/dialog"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { Presence } from "../../components/presence"

const SLIDE_COUNT = 30

function CarouselInDialog({ page, onPageChange }: { page: number; onPageChange: (page: number) => void }) {
  const service = useMachine(carousel.machine, {
    id: useId(),
    slideCount: SLIDE_COUNT,
    page,
    onPageChange({ page }) {
      onPageChange(page)
    },
  })
  const api = carousel.connect(service, normalizeProps)

  return (
    <div className="carousel">
      <div {...api.getRootProps()}>
        <div {...api.getControlProps()}>
          <button {...api.getPrevTriggerProps()}>Prev</button>
          <button {...api.getNextTriggerProps()}>Next</button>
        </div>

        <div {...api.getItemGroupProps()}>
          {Array.from({ length: SLIDE_COUNT }, (_, i) => (
            <div {...api.getItemProps({ index: i })} key={i}>
              <img src={`https://picsum.photos/seed/slide-${i}/300/200`} alt={`Slide ${i}`} style={{ width: "100%" }} />
            </div>
          ))}
        </div>

        <div {...api.getIndicatorGroupProps()}>
          {api.pageSnapPoints.map((_, index) => (
            <button {...api.getIndicatorProps({ index })} key={index} />
          ))}
        </div>

        <p data-testid="page-display">Current page: {api.page}</p>
      </div>
    </div>
  )
}

export default function Page() {
  const [page, setPage] = useState(0)

  const service = useMachine(dialog.machine, { id: useId() })
  const api = dialog.connect(service, normalizeProps)

  return (
    <main>
      <button {...api.getTriggerProps()} data-testid="open-dialog">
        Open Carousel in Dialog
      </button>

      <Portal>
        <Presence {...api.getBackdropProps()} />
        <div {...api.getPositionerProps()}>
          <Presence {...api.getContentProps()}>
            <h2 {...api.getTitleProps()}>Carousel in Dialog</h2>
            <p {...api.getDescriptionProps()}>Navigate past page 10 to test the fix.</p>
            <CarouselInDialog page={page} onPageChange={setPage} />
            <button {...api.getCloseTriggerProps()} data-testid="close-dialog">
              Close
            </button>
          </Presence>
        </div>
      </Portal>
    </main>
  )
}
