import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { XIcon } from "lucide-solid"
import { createMemo, createSignal, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/popover.css"

export default function Page() {
  return (
    <div class="App">
      <Popover />
    </div>
  )
}

function Popover() {
  const [open, setOpen] = createSignal(false)

  const id = createUniqueId()
  const service = useMachine(popover.machine, () => ({
    id,
    onOpenChange: (details) => setOpen(details.open),
    open: open(),
  }))

  const api = createMemo(() => popover.connect(service, normalizeProps))

  return (
    <main>
      <button {...api().getTriggerProps()}>Click me</button>
      <Portal>
        <div {...api().getPositionerProps()}>
          <div {...api().getContentProps()}>
            <div {...api().getTitleProps()}>Presenters</div>
            <div {...api().getDescriptionProps()}>Description</div>
            <button>Action Button</button>
            <button {...api().getCloseTriggerProps()}>
              <XIcon />
            </button>
          </div>
        </div>
      </Portal>
    </main>
  )
}
