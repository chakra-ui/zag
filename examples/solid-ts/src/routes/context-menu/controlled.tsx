import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/menu.css"

export default function Page() {
  const [open, setOpen] = createSignal(false)

  const id = createUniqueId()
  const service = useMachine(menu.machine, () => ({
    id,
    open: open(),
    onOpenChange: (details) => setOpen(details.open),
    onSelect: console.log,
  }))

  const api = createMemo(() => menu.connect(service, normalizeProps))

  return (
    <>
      <main class="context-menu">
        <div {...api().getContextTriggerProps()}>Right Click here</div>
        <Portal>
          <div {...api().getPositionerProps()}>
            <ul {...api().getContentProps()}>
              <li {...api().getItemProps({ value: "edit" })}>Edit</li>
              <li {...api().getItemProps({ value: "duplicate" })}>Duplicate</li>
              <li {...api().getItemProps({ value: "delete" })}>Delete</li>
              <li {...api().getItemProps({ value: "export" })}>Export...</li>
            </ul>
          </div>
        </Portal>
      </main>

      <Toolbar controls={null}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
