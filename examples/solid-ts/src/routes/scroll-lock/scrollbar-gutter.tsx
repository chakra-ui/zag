import { preventBodyScroll } from "@zag-js/remove-scroll"
import { createEffect, createSignal } from "solid-js"
import "@styles/scroll-lock.css"

export default function Page() {
  const [locked, setLocked] = createSignal(false)

  createEffect(locked, (isLocked) => {
    if (!isLocked) return
    return preventBodyScroll()
  })

  return (
    <main>
      <div class="scrollbar-gutter">
        <div class="header">Northwind Design</div>
        <p class="hint">Lock scrolling and watch the header keep its width.</p>
        <button aria-pressed={locked() ? "true" : "false"} onClick={() => void setLocked((v) => !v)}>
          {locked() ? "Unlock scrolling" : "Lock scrolling"}
        </button>
      </div>
    </main>
  )
}
