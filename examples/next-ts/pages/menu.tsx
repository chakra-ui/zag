import { Global } from "@emotion/react"
import * as menu from "@zag-js/menu"
import { useMachine, useSetup } from "@zag-js/react"
import { useId } from "react"
import { menuStyle } from "../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

export default function Page() {
  const [state, send] = useMachine(
    menu.machine.withContext({
      onSelect: console.log,
    }),
  )
  const ref = useSetup({ send, id: useId() })

  const api = menu.connect(state, send)

  return (
    <>
      <Global styles={menuStyle} />

      <div ref={ref}>
        <button {...api.triggerProps}>
          Actions <span aria-hidden>▾</span>
        </button>
        <div {...api.positionerProps}>
          <ul {...api.contentProps}>
            <li {...api.getItemProps({ id: "edit" })}>Edit</li>
            <li {...api.getItemProps({ id: "duplicate" })}>Duplicate</li>
            <li {...api.getItemProps({ id: "delete" })}>Delete</li>
            <li {...api.getItemProps({ id: "export" })}>Export...</li>
          </ul>
        </div>
      </div>

      <StateVisualizer state={state} />
    </>
  )
}
