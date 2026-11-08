import { preventBodyScroll } from "@zag-js/remove-scroll"
import { createEffect, createSignal, Show } from "solid-js"
import "@styles/scroll-lock.css"

export default function Page() {
  const [open, setOpen] = createSignal(false)

  createEffect(open, (isOpen) => {
    if (!isOpen) return
    return preventBodyScroll()
  })

  return (
    <main>
      <div class="body-scroller">
        <p class="hint">Open the filters, then try scrolling the page behind them.</p>
        <button data-testid="open-panel" onClick={() => setOpen(true)}>
          Open filters
        </button>

        <Show when={open()}>
          <div class="backdrop" />
          <div class="panel" role="dialog" aria-modal="true" aria-label="Filters" data-testid="panel">
            <span class="panel-title">Filters</span>
            <p>Narrow the results by price, brand and rating.</p>
            <button data-testid="close-panel" onClick={() => setOpen(false)}>
              Show 24 results
            </button>
          </div>
        </Show>
      </div>
    </main>
  )
}
