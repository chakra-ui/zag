import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { menuControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(menuControls)
  const [state, send] = useMachine(menu.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => menu.connect(state, send, normalizeProps))

  return (
    <>
      <main>
        <div>
          <button {...api().triggerProps}>
            Actions <span {...api().indicatorProps}>▾</span>
          </button>

          <Portal>
            <div {...api().positionerProps}>
              <ul {...api().contentProps}>
                <li {...api().getItemProps({ value: "edit" })}>Edit</li>
                <li {...api().getItemProps({ value: "duplicate" })}>Duplicate</li>
                <li {...api().getItemProps({ value: "delete" })}>Delete</li>
                <li {...api().getItemProps({ value: "export" })}>Export...</li>
              </ul>
            </div>
          </Portal>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
