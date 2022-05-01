import { Global } from "@emotion/react"
import * as menu from "@zag-js/menu"
import { useMachine, useSetup } from "@zag-js/react"
import { useId } from "react"
import { menuStyle } from "../../../shared/style"
import { Portal } from "../components/portal"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const [state, send] = useMachine(menu.machine({ onSelect: console.log }))
  const ref = useSetup({ send, id: useId() })

  const api = menu.connect(state, send)

  return (
    <>
      <Global styles={menuStyle} />

      <main>
        <div ref={ref}>
          <button {...api.triggerProps}>
            Actions <span aria-hidden>▾</span>
          </button>
          <Portal>
            <div {...api.positionerProps}>
              <ul {...api.contentProps}>
                <li {...api.getItemProps({ id: "edit" })}>Edit</li>
                <li {...api.getItemProps({ id: "duplicate" })}>Duplicate</li>
                <li {...api.getItemProps({ id: "delete" })}>Delete</li>
                <li {...api.getItemProps({ id: "export" })}>Export...</li>
              </ul>
            </div>
          </Portal>
        </div>
      </main>
      <Toolbar controls={null}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
