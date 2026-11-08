import { trackDismissableElement } from "@zag-js/dismissable"
import { createSignal, createTrackedEffect } from "solid-js"
import "@styles/dismissable.css"

export default function Page() {
  const [open, setOpen] = createSignal(false)
  const [draft, setDraft] = createSignal("")
  const [blocked, setBlocked] = createSignal(false)

  let triggerRef: HTMLButtonElement | undefined
  let panelRef: HTMLDivElement | undefined

  createTrackedEffect(() => {
    if (!open()) return
    return trackDismissableElement(panelRef ?? null, {
      exclude: [triggerRef ?? null],
      onLayerChange: () => {},
      onInteractOutside(event) {
        if (!draft()) return
        event.preventDefault()
        setBlocked(true)
      },
      onEscapeKeyDown(event) {
        if (!draft()) return
        event.preventDefault()
        setBlocked(true)
      },
      onDismiss: () => setOpen(false),
    })
  })

  return (
    <main class="prevent-dismiss">
      <button
        ref={triggerRef}
        data-testid="trigger"
        onClick={() => {
          setBlocked(false)
          setOpen((value) => !value)
        }}
      >
        Reply to Ama
      </button>

      <div ref={panelRef} hidden={!open()} role="dialog" aria-label="Reply" data-testid="panel" class="panel">
        <label for="reply">Your reply</label>
        <textarea
          id="reply"
          data-testid="reply"
          value={draft()}
          onInput={(event) => {
            setDraft(event.currentTarget.value)
            if (!event.currentTarget.value) setBlocked(false)
          }}
        />
        <p role="status" data-testid="hint" class="hint">
          {blocked() ? "Your reply is not sent yet. Clear it to close this panel." : ""}
        </p>
      </div>

      <p data-testid="outside">
        Ama asked whether the Lagos shipment will arrive before the 14th. Click here to try closing the reply.
      </p>
    </main>
  )
}
