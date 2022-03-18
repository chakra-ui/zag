import { Global } from "@emotion/react"
import * as Menu from "@ui-machines/menu"
import { useMachine, useSetup } from "@ui-machines/react"
import { menuStyle } from "../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

export default function Page() {
  const [state, send] = useMachine(
    Menu.machine.withContext({
      onSelect: console.log,
    }),
  )

  const ref = useSetup<HTMLButtonElement>({ send, id: "1" })

  const { contentProps, getItemProps, triggerProps, positionerProps } = Menu.connect(state, send)

  return (
    <>
      <Global styles={menuStyle} />

      <div>
        <button className="menu__trigger" ref={ref} {...triggerProps}>
          Actions <span aria-hidden>▾</span>
        </button>
        <div {...positionerProps}>
          <ul className="menu__content" {...contentProps}>
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
        </div>
      </div>

      <StateVisualizer state={state} />
    </>
  )
}
