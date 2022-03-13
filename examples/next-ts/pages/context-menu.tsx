import { Global } from "@emotion/react"
import * as Menu from "@ui-machines/menu"
import { useMachine, useSetup } from "@ui-machines/react"
import { menuStyle } from "../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

export default function Page() {
  const [state, send] = useMachine(
    Menu.machine.withContext({
      contextMenu: true,
      onSelect: console.log,
    }),
  )

  const { contentProps, contextTriggerProps, getItemProps } = Menu.connect(state, send)

  const ref = useSetup<HTMLUListElement>({ send, id: "1" })

  return (
    <>
      <Global styles={menuStyle} />
      <div {...contextTriggerProps}>
        <div style={{ border: "solid 1px red" }}>Open context menu</div>
      </div>
      <ul ref={ref} className="menu__content" {...contentProps}>
        <li className="menu__item" {...getItemProps({ id: "edit" })}>
          Edit
        </li>
        <li className="menu__item" {...getItemProps({ id: "duplicate" })}>
          Duplicate
        </li>
        <li className="menu__item" {...getItemProps({ id: "delete" })}>
          Delete
        </li>
        <li className="menu__item" {...getItemProps({ id: "export" })}>
          Export...
        </li>
      </ul>

      <StateVisualizer state={state} />
    </>
  )
}
