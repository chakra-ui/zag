import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/menu.css"

const MenuMultipleControlled = () => {
  const [open, setOpen] = createSignal(false)

  const id = createUniqueId()

  const service = useMachine(menu.machine, () => ({
    id,
    onOpenChange: (details: menu.OpenChangeDetails) => setOpen(details.open),
    open: open(),
  }))

  const api = createMemo(() => menu.connect(service, normalizeProps))

  return (
    <>
      <button {...api().getTriggerProps()}>Click me</button>
      <Portal>
        <div {...api().getPositionerProps()}>
          <div {...api().getContentProps()}>
            <li {...api().getItemProps({ value: "edit" })}>Edit</li>
            <li {...api().getItemProps({ value: "duplicate" })}>Duplicate</li>
            <li {...api().getItemProps({ value: "delete" })}>Delete</li>
            <li {...api().getItemProps({ value: "export" })}>Export...</li>
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
        <MenuMultipleControlled />
        <MenuMultipleControlled />
      </div>
    </main>
  )
}
