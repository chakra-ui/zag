import { preventBodyScroll } from "@zag-js/remove-scroll"
import { createEffect, createSignal, For, onSettled, Show } from "solid-js"
import "@styles/scroll-lock.css"

const items = Array.from({ length: 30 }, (_, i) => `Result ${i + 1}`)

export default function Page() {
  const [open, setOpen] = createSignal(false)
  const [navHidden, setNavHidden] = createSignal(false)

  onSettled(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      setNavHidden(window.scrollY > lastY)
      lastY = window.scrollY
    }
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  })

  createEffect(open, (isOpen) => {
    if (!isOpen) return
    return preventBodyScroll()
  })

  return (
    <main>
      <div class="scroll-position">
        <nav class="nav" data-hidden={navHidden() || undefined}>
          Store
          <button onClick={() => setOpen(true)}>Open filters</button>
        </nav>
        <p class="hint">
          Scroll down, then up until the nav shows. Open and close the filters: the nav should stay put.
        </p>

        <Show when={open()}>
          <div class="backdrop" />
          <div class="panel" role="dialog" aria-modal="true" aria-label="Filters">
            <span class="panel-title">Filters</span>
            <div class="list">
              <For each={items}>{(item) => <p>{item}</p>}</For>
            </div>
            <button onClick={() => setOpen(false)}>Show results</button>
          </div>
        </Show>
      </div>
    </main>
  )
}
