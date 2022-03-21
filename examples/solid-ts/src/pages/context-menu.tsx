import { injectGlobal } from "@emotion/css"
import * as Menu from "@ui-machines/menu"
import { normalizeProps, SolidPropTypes, useMachine, useSetup } from "@ui-machines/solid"
import { createMemo } from "solid-js"
import { menuStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

injectGlobal(menuStyle)

export default function Page() {
  const [state, send] = useMachine(
    Menu.machine.withContext({
      contextMenu: true,
      onSelect: console.log,
    }),
  )

  const ref = useSetup<HTMLUListElement>({ send, id: "1" })

  const menu = createMemo(() => Menu.connect<SolidPropTypes>(state, send, normalizeProps))

  return (
    <>
      <div>
        <div {...menu().contextTriggerProps}>
          <div style={{ border: "solid 1px red" }}>Open context menu</div>
        </div>
        <div {...menu().positionerProps}>
          <ul ref={ref} className="menu__content" {...menu().contentProps}>
            <li className="menu__item" {...menu().getItemProps({ id: "edit" })}>
              Edit
            </li>
            <li className="menu__item" {...menu().getItemProps({ id: "duplicate" })}>
              Duplicate
            </li>
            <li className="menu__item" {...menu().getItemProps({ id: "delete" })}>
              Delete
            </li>
            <li className="menu__item" {...menu().getItemProps({ id: "export" })}>
              Export...
            </li>
          </ul>
        </div>
      </div>

      <StateVisualizer state={state} />
    </>
  )
}
