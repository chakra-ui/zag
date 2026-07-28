import * as dialog from "@zag-js/dialog"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { useEffect } from "react"

export default function Page() {
  const service = useMachine(dialog.machine, { id: "1" })
  const api = dialog.connect(service, normalizeProps)

  // Make <html> establish its own scroll container, like an app-shell layout that scrolls the
  // viewport itself rather than relying on <body>'s default overflow propagation.
  useEffect(() => {
    document.documentElement.style.overflowY = "auto"
    return () => {
      document.documentElement.style.removeProperty("overflow-y")
    }
  }, [])

  return (
    <main>
      <p>The dialog's scroll lock should apply to &lt;html&gt;, not &lt;body&gt;, on this page.</p>

      <button {...api.getTriggerProps()} data-testid="dialog-trigger">
        Open Dialog
      </button>

      {api.open && (
        <Portal>
          <div {...api.getBackdropProps()} />
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <h2 {...api.getTitleProps()}>Dialog</h2>
              <p {...api.getDescriptionProps()}>Dialog content</p>
              <button {...api.getCloseTriggerProps()} data-testid="dialog-close">
                Close
              </button>
            </div>
          </div>
        </Portal>
      )}

      <Portal>
        <div data-testid="tall-content" style={{ height: "4000px" }} />
      </Portal>
    </main>
  )
}
