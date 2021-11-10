import { menu } from "@ui-machines/web"
import { normalizeProps, useMachine, useSetup, SolidPropTypes } from "@ui-machines/solid"

import { createMemo } from "solid-js"
import { css, CSSObject } from "@emotion/css"

import { StateVisualizer } from "../components/state-visualizer"
import { menuStyle } from "../../../../shared/style"

const styles = css(menuStyle as CSSObject)

export default function Page() {
  const [state, send] = useMachine(
    menu.machine.withContext({
      uid: "123",
      onSelect: console.log,
    }),
  )

  const ref = useSetup<HTMLButtonElement>({ send, id: "123" })

  const machineState = createMemo(() => menu.connect<SolidPropTypes>(state, send, normalizeProps))

  return (
    <div className={styles}>
      <button ref={ref} {...machineState().triggerProps}>
        Click me
      </button>
      <ul style={{ width: "300px" }} {...machineState().menuProps}>
        <li {...machineState().getItemProps({ id: "menuitem-1" })}>Edit</li>
        <li {...machineState().getItemProps({ id: "menuitem-2" })}>Duplicate</li>
        <li {...machineState().getItemProps({ id: "menuitem-3" })}>Delete</li>
      </ul>

      <StateVisualizer state={state} />
    </div>
  )
}
