import { css } from "@emotion/css"
import * as Menu from "@ui-machines/menu"
import { normalizeProps, SolidPropTypes, useMachine, useSetup } from "@ui-machines/solid"
import { createMemo, createUniqueId } from "solid-js"
import { menuStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

const styles = css(menuStyle)

export default function Page() {
  const [state, send] = useMachine(
    Menu.machine.withContext({
      onSelect: console.log,
    }),
  )

  const ref = useSetup<HTMLButtonElement>({ send, id: createUniqueId() })

  const menu = createMemo(() => Menu.connect<SolidPropTypes>(state, send, normalizeProps))

  return (
    <div className={styles}>
      <button ref={ref} {...menu().triggerProps}>
        Click me
      </button>
      <ul style={{ width: "300px" }} {...menu().contentProps}>
        <li {...menu().getItemProps({ id: "menuitem-1" })}>Edit</li>
        <li {...menu().getItemProps({ id: "menuitem-2" })}>Duplicate</li>
        <li {...menu().getItemProps({ id: "menuitem-3" })}>Delete</li>
      </ul>

      <StateVisualizer state={state} />
    </div>
  )
}
