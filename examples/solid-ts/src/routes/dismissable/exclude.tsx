import { trackDismissableElement } from "@zag-js/dismissable"
import { For, createSignal, createTrackedEffect } from "solid-js"
import "@styles/dismissable.css"

const sortOptions = ["Newest", "Price: low to high", "Rating"]

export default function Page() {
  const [open, setOpen] = createSignal(false)
  const [sort, setSort] = createSignal(sortOptions[0])

  let triggerRef: HTMLButtonElement | undefined
  let panelRef: HTMLDivElement | undefined
  let toolbarRef: HTMLDivElement | undefined

  createTrackedEffect(() => {
    if (!open()) return
    return trackDismissableElement(panelRef ?? null, {
      exclude: [triggerRef ?? null, toolbarRef ?? null],
      onLayerChange: () => {},
      onDismiss: () => setOpen(false),
    })
  })

  return (
    <main>
      <div class="exclude">
        <div ref={toolbarRef} role="toolbar" aria-label="Sort results" data-testid="toolbar" class="sort-bar">
          <For each={sortOptions}>
            {(option) => (
              <button aria-pressed={sort() === option ? "true" : "false"} onClick={() => setSort(option)}>
                {option}
              </button>
            )}
          </For>
        </div>

        <button ref={triggerRef} data-testid="trigger" onClick={() => setOpen((value) => !value)}>
          Filters
        </button>

        <div ref={panelRef} hidden={!open()} role="dialog" aria-label="Filters" data-testid="panel" class="panel">
          <strong>Filter running shoes</strong>
          <label>
            <input type="checkbox" /> In stock
          </label>
          <label>
            <input type="checkbox" /> Free delivery
          </label>
        </div>

        <p role="status" data-testid="status" class="status">
          Sorted by {sort()}
        </p>
        <p data-testid="outside">Showing 24 results. Click here to close the filters.</p>
      </div>
    </main>
  )
}
