import { Global } from "@emotion/react"
import * as Menu from "@ui-machines/menu"
import { useMachine, useSetup } from "@ui-machines/react"
import { StateVisualizer } from "components/state-visualizer"
import { menuStyle } from "../../../shared/style"

export default function Page() {
  const [state, send] = useMachine(
    Menu.machine.withContext({
      uid: "123",
      onSelect: console.log,
    }),
  )

  const ref = useSetup<HTMLButtonElement>({ send, id: "1" })
  const { contentProps, getItemProps, triggerProps } = Menu.connect(state, send)

  return (
    <>
      <Global styles={menuStyle} />
      <button ref={ref} {...triggerProps}>
        Click me
      </button>
      <ul {...contentProps}>
        <li {...getItemProps({ id: "menuitem-1" })}>Edit</li>
        <li {...getItemProps({ id: "menuitem-2" })}>Duplicate</li>
        <li {...getItemProps({ id: "menuitem-3" })}>Delete</li>
      </ul>
      <StateVisualizer state={state} />
    </>
  )
}
