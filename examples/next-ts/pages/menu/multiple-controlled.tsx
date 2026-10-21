import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useEffect, useId, useRef, useState } from "react"

interface MenuOptions {
  closeDelay: number
  preventOutside: boolean
  disabled?: boolean
}

const MenuMultipleControlled = ({ closeDelay, preventOutside, disabled }: MenuOptions) => {
  const [open, setOpen] = useState(false)
  const [closePending, setClosePending] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(closeTimer.current), [])

  const service = useMachine(menu.machine, {
    id: useId(),
    onOpenChange(details) {
      clearTimeout(closeTimer.current)
      if (!details.open && closeDelay) {
        setClosePending(true)
        closeTimer.current = setTimeout(() => {
          setOpen(false)
          setClosePending(false)
        }, closeDelay)
      } else {
        setClosePending(false)
        setOpen(details.open)
      }
    },
    onInteractOutside(event) {
      if (preventOutside) event.preventDefault()
    },
    open: open,
  })

  const api = menu.connect(service, normalizeProps)

  return (
    <div>
      <output
        data-testid="close-pending"
        style={{ display: "block", height: "24px", visibility: closePending ? "visible" : "hidden" }}
      >
        Close requested
      </output>
      <button {...api.getTriggerProps()} disabled={disabled}>
        Click me
      </button>
      <Portal>
        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <li {...api.getItemProps({ value: "edit" })}>Edit</li>
            <li {...api.getItemProps({ value: "duplicate" })}>Duplicate</li>
            <li {...api.getItemProps({ value: "delete" })}>Delete</li>
            <li {...api.getItemProps({ value: "export" })}>Export...</li>
          </div>
        </div>
      </Portal>
    </div>
  )
}

export default function Page() {
  const [delayClose, setDelayClose] = useState(false)
  const [preventOutside, setPreventOutside] = useState(false)
  const [disableSecond, setDisableSecond] = useState(false)
  const options = { closeDelay: delayClose ? 1000 : 0, preventOutside }
  return (
    <main>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
        <label>
          <input type="checkbox" checked={delayClose} onChange={(event) => setDelayClose(event.target.checked)} />
          Delay close confirmation by one second
        </label>
        <label>
          <input
            type="checkbox"
            checked={preventOutside}
            onChange={(event) => setPreventOutside(event.target.checked)}
          />
          Prevent outside dismissal
        </label>
        <label>
          <input type="checkbox" checked={disableSecond} onChange={(event) => setDisableSecond(event.target.checked)} />
          Disable second trigger
        </label>
        <label>
          Outside input <input aria-label="Outside input" />
        </label>
      </div>
      <div style={{ display: "flex", gap: "16px" }}>
        <MenuMultipleControlled {...options} />
        <MenuMultipleControlled {...options} disabled={disableSecond} />
      </div>
    </main>
  )
}
