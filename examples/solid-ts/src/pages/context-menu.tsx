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
      <main>
        <div>
          <div {...api().contextTriggerProps}>
            <div style={{ border: "solid 1px red" }}>Open context menu</div>
          </div>
          <Portal>
            <div {...api().positionerProps}>
              <ul class="menu-content" {...api().contentProps}>
                <li {...api().getItemProps({ id: "edit" })}>Edit</li>
                <li {...api().getItemProps({ id: "duplicate" })}>Duplicate</li>
                <li {...api().getItemProps({ id: "delete" })}>Delete</li>
                <li {...api().getItemProps({ id: "export" })}>Export...</li>
              </ul>
            </div>
          </Portal>
        </div>
      </main>

      <Toolbar controls={null} visualizer={<StateVisualizer state={state} />} />
    </>
  )
}
