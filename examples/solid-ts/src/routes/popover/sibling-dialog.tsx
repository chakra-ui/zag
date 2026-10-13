import * as dialog from "@zag-js/dialog"
import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createEffect, createMemo, createSignal, createUniqueId, onCleanup, Show } from "solid-js"
import { Portal } from "solid-js/web"
import { Presence } from "~/components/presence"
import "@styles/popover.css"
import "@styles/dialog.css"

function ToggleTip() {
  const [open, setOpen] = createSignal(false)

  createEffect(() => {
    if (!open()) return
    const timer = setTimeout(() => setOpen(false), 2000)
    onCleanup(() => clearTimeout(timer))
  })

  const id = createUniqueId()
  const service = useMachine(popover.machine, () => ({
    id,
    open: open(),
    onOpenChange(details) {
      setOpen(details.open)
    },
    closeOnInteractOutside: false,
    restoreFocus: false,
  }))

  const api = createMemo(() => popover.connect(service, normalizeProps))

  return (
    <div style={{ display: "inline-block" }}>
      <button data-testid="toggletip-trigger" {...api().getTriggerProps()}>
        ℹ Info
      </button>
      <Portal>
        <div {...api().getPositionerProps()}>
          <Presence data-testid="toggletip-content" class="popover-content" {...api().getContentProps()}>
            <div {...api().getArrowProps()}>
              <div {...api().getArrowTipProps()} />
            </div>
            <div {...api().getTitleProps()}>Toggle Tip</div>
            <div data-part="body">This is some additional information. It will close in 2 seconds.</div>
          </Presence>
        </div>
      </Portal>
    </div>
  )
}

export default function Page() {
  const service = useMachine(dialog.machine, {
    id: createUniqueId(),
    // Keep the dialog open when a sibling layer (toggle-tip) is removed
    onRequestDismiss(event) {
      event.preventDefault()
    },
  })
  const api = createMemo(() => dialog.connect(service, normalizeProps))

  return (
    <main>
      <div style={{ padding: "20px", display: "flex", "flex-direction": "row", gap: "12px", "align-items": "center" }}>
        <ToggleTip />
        <button data-testid="dialog-trigger" {...api().getTriggerProps()}>
          Open Dialog
        </button>
      </div>

      <Show when={api().open}>
        <Portal>
          <div {...api().getBackdropProps()} />
          <div {...api().getPositionerProps()}>
            <div {...api().getContentProps()}>
              <h2 {...api().getTitleProps()}>Dialog Title</h2>
              <div {...api().getDescriptionProps()}>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                  dolore magna aliqua.
                </p>
              </div>
              <div style={{ "margin-top": "20px", display: "flex", gap: "10px", "justify-content": "flex-end" }}>
                <button {...api().getCloseTriggerProps()} data-testid="dialog-close">
                  Cancel
                </button>
                <button data-testid="dialog-save">Save</button>
              </div>
            </div>
          </div>
        </Portal>
      </Show>
    </main>
  )
}
