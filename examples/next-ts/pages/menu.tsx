import { Global } from "@emotion/react"
import { useMachine } from "@ui-machines/react"
import { menu } from "@ui-machines/menu"
import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"
import { menuStyle } from "../../../shared/style"

export default function Page() {
  const [state, send] = useMachine(
    menu.machine.withContext({
      uid: "123",
      onSelect: console.log,
    }),
  )

  const ref = useMount<HTMLButtonElement>(send)
  const { menuProps, getItemProps, triggerProps } = menu.connect(state, send)

  return (
    <>
      <Global styles={menuStyle} />
      <button ref={ref} {...triggerProps}>
        Click me
      </button>
      <ul style={{ width: "300px" }} {...menuProps}>
        <li {...getItemProps({ id: "menuitem-1" })}>Edit</li>
        <li {...getItemProps({ id: "menuitem-2" })}>Duplicate</li>
        <li {...getItemProps({ id: "menuitem-3" })}>Delete</li>
      </ul>
      <StateVisualizer state={state} />
    </>
  )
}
