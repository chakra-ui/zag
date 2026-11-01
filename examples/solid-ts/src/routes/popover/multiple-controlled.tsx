import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/popover.css"

function PopoverControlled() {
  const [open, setOpen] = createSignal(false)

  const id = createUniqueId()
  const service = useMachine(popover.machine, () => ({
    id,
    onOpenChange: (details) => setOpen(details.open),
    open: open(),
  }))

  const api = createMemo(() => popover.connect(service, normalizeProps))

  return (
    <>
      <button {...api().getTriggerProps()}>Click me</button>
      <Portal>
        <div {...api().getPositionerProps()}>
          <div {...api().getContentProps()}>
            <div {...api().getTitleProps()}>Presenters</div>
            <div {...api().getDescriptionProps()}>Description</div>
            <button onClick={() => setOpen(false)}>Action Button</button>
          </div>
        </div>
      </Portal>
    </>
  )
}

export default function Page() {
  return (
    <main>
      <div style={{ display: "flex", gap: "16px" }}>
        <PopoverControlled />
        <PopoverControlled />
      </div>
    </main>
  )
}
