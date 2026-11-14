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
        <button onClick={() => setOpen(true)}>Open filters</button>

        <Show when={open()}>
          <div class="backdrop" />
          <div class="panel" role="dialog" aria-modal="true" aria-label="Filters">
            <span class="panel-title">Filters</span>
            <p>Narrow the results by price, brand and rating.</p>
            <button onClick={() => setOpen(false)}>Show 24 results</button>
          </div>
        </Show>
      </div>
    </main>
  )
}
