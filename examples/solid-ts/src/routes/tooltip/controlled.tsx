import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tooltip from "@zag-js/tooltip"
import { Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/tooltip.css"

export default function Page() {
  const [open, setOpen] = createSignal(false)

  const service = useMachine(tooltip.machine, {
    id: createUniqueId(),
    get open() {
      return open()
    },
    onOpenChange: (details) => setOpen(details.open),
  })

  const api = createMemo(() => tooltip.connect(service, normalizeProps))

  return (
    <div style={{ padding: "40px", height: "200vh" }}>
      <h1>Tooltip Controlled</h1>
      <h1>{String(open())}</h1>

      <div style={{ display: "flex", gap: "20px" }}>
        <button type="button" onClick={() => setOpen(true)}>
          Open
        </button>
        <button type="button" onClick={() => setOpen(false)}>
          Close
        </button>

        <button {...api().getTriggerProps()}>Some tooltip</button>
        <Show when={api().open}>
          <Portal>
            <div {...api().getPositionerProps()}>
              <div {...api().getContentProps()}>Tooltip Content</div>
            </div>
          </Portal>
        </Show>
      </div>
    </div>
  )
}
