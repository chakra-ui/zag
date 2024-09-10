import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { menuControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(menuControls)
  const [state, send] = useMachine(menu.machine({ id: useId(), onSelect: console.log }), {
    context: controls.context,
  })

  const api = menu.connect(state, send, normalizeProps)

  return (
    <>
      <main>
        <div>
          <button {...api.getTriggerProps()}>
            Actions <span {...api.getIndicatorProps()}>▾</span>
          </button>
          {api.open && (
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
          )}
        </div>
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
