import { injectGlobal } from "@emotion/css"
import * as Menu from "@ui-machines/menu"
import { normalizeProps, PropTypes, useMachine, useSetup } from "@ui-machines/solid"
import { createMemo } from "solid-js"
import { menuStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

injectGlobal(menuStyle)

export default function Page() {
  const [state, send] = useMachine(Menu.machine)

  const ref = useSetup<HTMLButtonElement>({ send, id: "1" })

  const menu = createMemo(() => Menu.connect<PropTypes>(state, send, normalizeProps))

  return (
    <>
      <div>
        <button className="menu__trigger" ref={ref} {...menu().triggerProps}>
          Actions <span aria-hidden>▾</span>
        </button>
        <div {...menu().positionerProps}>
          <ul className="menu__content" {...menu().contentProps}>
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
