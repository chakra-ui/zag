import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine, Portal } from "@zag-js/react"
import { useId } from "react"
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
      <main className="context-menu">
        <div {...api.getContextTriggerProps()}>Right Click here</div>
        <Portal>
          <div {...api.getPositionerProps()}>
            <ul {...api.getContentProps()}>
              <li {...api.getItemProps({ value: "edit" })}>Edit</li>
              <li {...api.getItemProps({ value: "duplicate" })}>Duplicate</li>
              <li {...api.getItemProps({ value: "delete" })}>Delete</li>
              <li {...api.getItemProps({ value: "export" })}>Export...</li>
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
