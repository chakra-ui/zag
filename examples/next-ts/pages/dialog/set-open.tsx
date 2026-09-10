import * as dialog from "@zag-js/dialog"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"

export default function Page() {
  const [log, setLog] = useState<boolean[]>([])

  const service = useMachine(dialog.machine, {
    id: useId(),
    onOpenChange(details) {
      setLog((prev) => [...prev, details.open])
    },
  })

  const api = dialog.connect(service, normalizeProps)

  return (
    <main>
      <div data-testid="open-state">{String(api.open)}</div>
      <div data-testid="open-change-log">{log.join(",")}</div>

      <button data-testid="reset" onClick={() => setLog([])}>
        Reset log
      </button>

      <button data-testid="set-open" onClick={() => api.setOpen(true)}>
        setOpen(true)
      </button>

      <button data-testid="set-closed" onClick={() => api.setOpen(false)}>
        setOpen(false)
      </button>

      <button
        data-testid="open-then-close"
        onClick={() => {
          api.setOpen(true)
          api.setOpen(false)
        }}
      >
        setOpen(true) then setOpen(false)
      </button>

      <button
        data-testid="close-then-open"
        onClick={() => {
          api.setOpen(false)
          api.setOpen(true)
        }}
      >
        setOpen(false) then setOpen(true)
      </button>

      <button
        data-testid="open-repeatedly"
        onClick={() => {
          for (let i = 0; i < 5; i++) api.setOpen(true)
        }}
      >
        setOpen(true) five times
      </button>

      {api.open && (
        <Portal>
          <div {...api.getBackdropProps()} />
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <h2 {...api.getTitleProps()}>Imperative control</h2>
              <p {...api.getDescriptionProps()}>Opened and closed through api.setOpen.</p>
              <button data-testid="content-set-closed" onClick={() => api.setOpen(false)}>
                setOpen(false)
              </button>
              <button {...api.getCloseTriggerProps()}>Close</button>
            </div>
          </div>
        </Portal>
      )}
    </main>
  )
}
