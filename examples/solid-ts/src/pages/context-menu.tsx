import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const [state, send] = useMachine(
    menu.machine({
      id: createUniqueId(),
      onSelect: console.log,
    }),
  )

  const api = createMemo(() => menu.connect(state, send, normalizeProps))

  return (
    <>
      <main class="context-menu">
        <div {...api().contextTriggerProps}>Right click here</div>
        <Portal>
          <div {...api().positionerProps}>
            <ul {...api().contentProps}>
              <li {...api().getItemProps({ id: "edit" })}>Edit</li>
              <li {...api().getItemProps({ id: "duplicate" })}>Duplicate</li>
              <li {...api().getItemProps({ id: "delete" })}>Delete</li>
              <li {...api().getItemProps({ id: "export" })}>Export...</li>
            </ul>
          </div>
        </Portal>
      </main>

      <Toolbar>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
