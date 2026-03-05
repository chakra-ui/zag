import * as carousel from "@zag-js/carousel"
import * as dialog from "@zag-js/dialog"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"

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
              <div
                style={{
                  height: "120px",
                  background: "#ddd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              >
                Slide {i}
              </div>
            </div>
          ))}
        </div>

        <div {...api.getIndicatorGroupProps()}>
          {api.pageSnapPoints.map((_, index) => (
            <button
              {...api.getIndicatorProps({ index })}
              key={index}
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: index === api.page ? "blue" : "#ccc",
                border: "none",
                cursor: "pointer",
                margin: "0 2px",
              }}
            />
          ))}
        </div>

        <p data-testid="page-display">Current page: {api.page}</p>
      </div>
    </div>
  )
}

export default function Page() {
  const [page, setPage] = useState(0)
  const [open, setOpen] = useState(false)

  const dialogService = useMachine(dialog.machine, {
    id: useId(),
    open,
    onOpenChange({ open }) {
      setOpen(open)
    },
  })
  const dialogApi = dialog.connect(dialogService, normalizeProps)

  return (
    <main style={{ padding: "20px" }}>
      <h1>Controlled Carousel in Dialog</h1>
      <p>External page state: {page}</p>

      <button {...dialogApi.getTriggerProps()} data-testid="open-dialog" style={{ marginBottom: "20px" }}>
        Open Dialog
      </button>

      {dialogApi.open && (
        <Portal>
          <div {...dialogApi.getBackdropProps()} />
          <div {...dialogApi.getPositionerProps()}>
            <div
              {...dialogApi.getContentProps()}
              style={{ background: "white", padding: "20px", width: "500px", borderRadius: "8px" }}
            >
              <h2 {...dialogApi.getTitleProps()}>Carousel in Dialog</h2>
              <p>External page: {page}</p>
              <CarouselInDialog page={page} onPageChange={setPage} />
              <button {...dialogApi.getCloseTriggerProps()} data-testid="close-dialog" style={{ marginTop: "12px" }}>
                Close
              </button>
            </div>
          </div>
        </Portal>
      )}
    </main>
  )
}
