import * as dialog from "@zag-js/dialog"
import * as popover from "@zag-js/popover"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { Fragment, useEffect, useId, useState } from "react"
import { Presence } from "../../components/presence"

function ToggleTip() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => setOpen(false), 2000)
    return () => clearTimeout(timer)
  }, [open])

  const service = useMachine(popover.machine, {
    id: useId(),
    portalled: true,
    open,
    onOpenChange(details) {
      setOpen(details.open)
    },
    closeOnInteractOutside: false,
    restoreFocus: false,
  })

  const api = popover.connect(service, normalizeProps)
  const Wrapper = api.portalled ? Portal : Fragment

  return (
    <div style={{ display: "inline-block" }}>
      <button data-testid="toggletip-trigger" {...api.getTriggerProps()}>
        ℹ Info
      </button>
      <Wrapper>
        <div {...api.getPositionerProps()}>
          <Presence data-testid="toggletip-content" className="popover-content" {...api.getContentProps()}>
            <div {...api.getArrowProps()}>
              <div {...api.getArrowTipProps()} />
            </div>
            <div {...api.getTitleProps()}>Toggle Tip</div>
            <div data-part="body">This is some additional information. It will close in 2 seconds.</div>
          </Presence>
        </div>
      </Wrapper>
    </div>
  )
}

export default function Page() {
  const service = useMachine(dialog.machine, {
    id: useId(),
    // Prevent the dialog from closing when a sibling layer (toggle-tip) is removed
    onRequestDismiss(event) {
      event.preventDefault()
    },
  })
  const api = dialog.connect(service, normalizeProps)

  return (
    <main>
      <div style={{ padding: "20px", display: "flex", flexDirection: "row", gap: "12px", alignItems: "center" }}>
        <ToggleTip />
        <button data-testid="dialog-trigger" {...api.getTriggerProps()}>
          Open Dialog
        </button>
      </div>

      {api.open && (
        <Portal>
          <div {...api.getBackdropProps()} />
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <h2 {...api.getTitleProps()}>Dialog Title</h2>
              <div {...api.getDescriptionProps()}>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                  dolore magna aliqua.
                </p>
              </div>
              <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button {...api.getCloseTriggerProps()} data-testid="dialog-close">
                  Cancel
                </button>
                <button data-testid="dialog-save">Save</button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </main>
  )
}
