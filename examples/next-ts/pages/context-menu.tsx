import { Global } from "@emotion/react"
import * as menu from "@ui-machines/menu"
import { useMachine, useSetup } from "@ui-machines/react"
import { menuStyle } from "../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

export default function Page() {
  const [state, send] = useMachine(
    menu.machine.withContext({
      contextMenu: true,
      onSelect: console.log,
    }),
  )

  const api = menu.connect(state, send)

  const ref = useSetup<HTMLUListElement>({ send, id: "1" })

  return (
    <>
      <Global styles={menuStyle} />

      <div {...api.contextTriggerProps}>
        <div style={{ border: "solid 1px red" }}>Open context menu</div>
      </div>

      <div {...api.positionerProps}>
        <ul ref={ref} {...api.contentProps}>
          <li {...api.getItemProps({ id: "edit" })}>Edit</li>
          <li {...api.getItemProps({ id: "duplicate" })}>Duplicate</li>
          <li {...api.getItemProps({ id: "delete" })}>Delete</li>
          <li {...api.getItemProps({ id: "export" })}>Export...</li>
        </ul>
      </div>

      <StateVisualizer state={state} />
    </>
  )
}
