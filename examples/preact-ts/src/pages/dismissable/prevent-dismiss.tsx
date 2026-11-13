import { trackDismissableElement } from "@zag-js/dismissable"
import { useLayoutEffect, useRef, useState } from "preact/hooks"
import "@styles/dismissable.css"

export default function Page() {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState("")
  const [blocked, setBlocked] = useState(false)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const dirtyRef = useRef(false)
  dirtyRef.current = draft.length > 0

  useLayoutEffect(() => {
    if (!open) return
    return trackDismissableElement(panelRef.current, {
      exclude: [triggerRef.current],
      onLayerChange: () => {},
      onInteractOutside(event) {
        if (!dirtyRef.current) return
        event.preventDefault()
        setBlocked(true)
      },
      onEscapeKeyDown(event) {
        if (!dirtyRef.current) return
        event.preventDefault()
        setBlocked(true)
      },
      onDismiss: () => setOpen(false),
    })
  }, [open])

  return (
    <main>
      <div className="prevent-dismiss">
        <button
          ref={triggerRef}
          onClick={() => {
            if (open && dirtyRef.current) return setBlocked(true)
            setBlocked(false)
            setOpen((value) => !value)
          }}
        >
          Reply to Ama
        </button>

        <div ref={panelRef} hidden={!open} role="dialog" aria-label="Reply" className="panel">
          <label htmlFor="reply">Your reply</label>
          <textarea
            id="reply"
            value={draft}
            onInput={(event) => {
              setDraft(event.currentTarget.value)
              if (!event.currentTarget.value) setBlocked(false)
            }}
          />
          <p role="status" className="hint">
            {blocked ? "Your reply is not sent yet. Clear it to close this panel." : ""}
          </p>
        </div>

        <p>Ama asked whether the Lagos shipment will arrive before the 14th. Click here to try closing the reply.</p>
      </div>
    </main>
  )
}
