import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { Portal } from "../components/portal"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const [state, send] = useMachine(
    menu.machine({
      id: useId(),
      onSelect: console.log,
    }),
  )

  const api = menu.connect(state, send, normalizeProps)

  return (
    <>
      <main>
        <div {...api.contextTriggerProps}>
          <div style={{ border: "solid 1px red" }}>Open context menu</div>
        </div>

        <Portal>
          <div {...api.positionerProps}>
            <ul className="menu-content" {...api.contentProps}>
              <li {...api.getItemProps({ id: "edit" })}>Edit</li>
              <li {...api.getItemProps({ id: "duplicate" })}>Duplicate</li>
              <li {...api.getItemProps({ id: "delete" })}>Delete</li>
              <li {...api.getItemProps({ id: "export" })}>Export...</li>
            </ul>
          </div>
        </Portal>
      </main>

      <Toolbar controls={null}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
