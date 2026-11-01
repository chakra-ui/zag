import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tooltip from "@zag-js/tooltip"
import { Index, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/tooltip.css"

function TooltipDemo() {
  const [open, setOpen] = createSignal(false)

  const service = useMachine(tooltip.machine, {
    id: createUniqueId(),
    get open() {
      return open()
    },
    onOpenChange: (details) => setOpen(details.open),
    positioning: { placement: "right" },
  })

  const api = createMemo(() => tooltip.connect(service, normalizeProps))

  return (
    <>
      <button {...api().getTriggerProps()}>Some tooltip</button>
      <Show when={api().open}>
        <Portal>
          <div {...api().getPositionerProps()}>
            <div {...api().getContentProps()}>Tooltip Content</div>
          </div>
        </Portal>
      </Show>
    </>
  )
}

const items = Array.from({ length: 10 }, (_, index) => index)

export default function Page() {
  return (
    <div style={{ padding: "40px", height: "200vh" }}>
      <h1>Tooltip Controlled (Multiple)</h1>
      <div style={{ display: "flex", "flex-direction": "column", gap: "4px" }}>
        <Index each={items}>{() => <TooltipDemo />}</Index>
      </div>
    </div>
  )
}
