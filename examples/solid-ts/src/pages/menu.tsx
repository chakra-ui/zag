import { menu } from "@ui-machines/web"
import { normalizeProps, useMachine, useSetup } from "@ui-machines/solid"

import { createMemo } from "solid-js"
import { css } from "@emotion/css"

import { StateVisualizer } from "../components/state-visualizer"
import { menuStyle } from "../../../../shared/style"

const styles = css(menuStyle)

export default function Page() {
  const [state, send] = useMachine(
    menu.machine.withContext({
      uid: "uid",
      onSelect: console.log,
    }),
  )

  const ref = useSetup<HTMLDivElement>({ send, id: "id" })

  const machineState = createMemo(() => menu.connect(state, send, normalizeProps))

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
