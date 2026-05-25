import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Show, createMemo, createSignal } from "solid-js"
import { Portal } from "solid-js/web"

export default function Page() {
  const [open, setOpen] = createSignal(false)

  const service = useMachine(dialog.machine, () => ({
    id: "1",
    open: open(),
    onOpenChange(details) {
      setOpen(details.open)
    },
  }))

  const api = createMemo(() => dialog.connect(service, normalizeProps))

  return (
    <div>
      <button onClick={() => setOpen(!open())}>Open Dialog</button>
      <p>state - isOpen: {String(open())}</p>
      <p>machine - isOpen: {String(api().open)}</p>
      <Show when={api().open}>
        <Portal>
          <div {...api().getBackdropProps()} />
          <div {...api().getPositionerProps()}>
            <div {...api().getContentProps()}>
              <h2 {...api().getTitleProps()}>Edit profile</h2>
              <p {...api().getDescriptionProps()}>Make changes to your profile here. Click save when you are done.</p>
              <div>
                <input placeholder="Enter name..." />
                <button>Save</button>
              </div>
              <button {...api().getCloseTriggerProps()}>Close</button>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  )
}
