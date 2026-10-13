import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, createMemo, createSignal, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/menu.css"

const items = [
  { label: "Edit", value: "edit" },
  { label: "Duplicate", value: "duplicate" },
  { label: "Delete", value: "delete" },
  { label: "Export...", value: "export" },
]

export default function Page() {
  const [open, setOpen] = createSignal(false)

  const id = createUniqueId()

  const service = useMachine(menu.machine, () => ({
    id,
    open: open(),
    onOpenChange: (details: menu.OpenChangeDetails) => setOpen(details.open),
  }))

  const api = createMemo(() => menu.connect(service, normalizeProps))

  return (
    <div style={{ padding: "40px", height: "200vh" }}>
      <h1>Menu Controlled</h1>
      <h1>{String(open())}</h1>

      <div style={{ display: "flex", gap: "12px", "margin-bottom": "24px" }}>
        <button type="button" onClick={() => setOpen(true)}>
          Open
        </button>
        <button type="button" onClick={() => setOpen(false)}>
          Close
        </button>
      </div>

      <button type="button" {...api().getTriggerProps()}>
        Menu Trigger
      </button>
      <Portal>
        <div {...api().getPositionerProps()}>
          <ul {...api().getContentProps()}>
            <For each={items}>{(item) => <li {...api().getItemProps({ value: item.value })}>{item.label}</li>}</For>
          </ul>
        </div>
      </Portal>
    </div>
  )
}
