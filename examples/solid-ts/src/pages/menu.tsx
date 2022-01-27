import { injectGlobal } from "@emotion/css"
import * as Menu from "@ui-machines/menu"
import { normalizeProps, SolidPropTypes, useMachine, useSetup } from "@ui-machines/solid"
import { createMemo } from "solid-js"
import { menuStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

injectGlobal(menuStyle)

export default function Page() {
  const [state, send] = useMachine(Menu.machine)

  const ref = useSetup<HTMLButtonElement>({ send, id: "1" })

  const menu = createMemo(() => Menu.connect<SolidPropTypes>(state, send, normalizeProps))

  return (
    <>
      <button ref={ref} {...menu().triggerProps}>
        Click me
      </button>
      <ul style={{ width: "300px" }} {...menu().contentProps}>
        <li {...menu().getItemProps({ id: "menuitem-1" })}>Edit</li>
        <li {...menu().getItemProps({ id: "menuitem-2" })}>Duplicate</li>
        <li {...menu().getItemProps({ id: "menuitem-3" })}>Delete</li>
      </ul>

      <StateVisualizer state={state} />
    </>
  )
}
