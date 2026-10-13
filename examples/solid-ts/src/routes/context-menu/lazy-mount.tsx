import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Show, createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/menu.css"

export default function Page() {
  const service = useMachine(menu.machine, {
    id: createUniqueId(),
    onSelect: console.log,
  })

  const api = createMemo(() => menu.connect(service, normalizeProps))

  return (
    <>
      <main class="context-menu">
        <div {...api().getContextTriggerProps()}>Right Click here</div>
        <Show when={api().open}>
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
        </Show>
      </main>

      <Toolbar controls={null}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
