import { preventBodyScroll } from "@zag-js/remove-scroll"
import { createEffect, createSignal, Show } from "solid-js"
import "@styles/scroll-lock.css"

export default function Page() {
  const [sheetOpen, setSheetOpen] = createSignal(false)
  const [confirmOpen, setConfirmOpen] = createSignal(false)

  createEffect(sheetOpen, (isOpen) => {
    if (!isOpen) return
    return preventBodyScroll()
  })

  createEffect(confirmOpen, (isOpen) => {
    if (!isOpen) return
    return preventBodyScroll()
  })

  const closeSheet = () => {
    setConfirmOpen(false)
    setSheetOpen(false)
  }

  return (
    <main>
      <div class="nested">
        <p class="hint">Open the settings, then the confirmation. Closing the confirmation keeps the page locked.</p>
        <button data-testid="open-sheet" onClick={() => setSheetOpen(true)}>
          Open settings
        </button>

        <Show when={sheetOpen()}>
          <div class="backdrop" />
          <div class="panel sheet" role="dialog" aria-modal="true" aria-label="Workspace settings" data-testid="sheet">
            <span class="panel-title">Workspace settings</span>
            <p>Rename the workspace, invite teammates or remove it for good.</p>
            <div class="row">
              <button data-testid="open-confirm" onClick={() => setConfirmOpen(true)}>
                Delete workspace
              </button>
              <button data-testid="close-sheet" onClick={closeSheet}>
                Close
              </button>
            </div>
          </div>
        </Show>

        <Show when={confirmOpen()}>
          <div class="backdrop" data-layer="confirm" />
          <div
            class="panel confirm"
            role="alertdialog"
            aria-modal="true"
            aria-label="Delete workspace?"
            data-testid="confirm"
          >
            <span class="panel-title">Delete workspace?</span>
            <p>All projects in Northwind Design will be removed.</p>
            <div class="row">
              <button data-testid="close-confirm" onClick={() => setConfirmOpen(false)}>
                Keep workspace
              </button>
            </div>
          </div>
        </Show>
      </div>
    </main>
  )
}
