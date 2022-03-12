import { Global } from "@emotion/react"
import * as Menu from "@ui-machines/menu"
import { useMachine, useSetup } from "@ui-machines/react"
import { useCallback, useEffect, useState } from "react"
import { menuStyle } from "../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

export default function Page() {
  const [state, send] = useMachine(
    Menu.machine.withContext({
      onSelect: console.log,
    }),
  )

  const { contentProps, getItemProps } = Menu.connect(state, send)

  const ref = useSetup<HTMLUListElement>({ send, id: "1" })

  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 })

  const contextMenuPositionStyle = {
    position: "fixed",
    top: anchorPoint.y,
    left: anchorPoint.x,
  } as const

  const contextMenuProps = { ...contentProps, style: { ...contentProps.style, ...contextMenuPositionStyle } }

  const handleContextMenu = useCallback(
    (event) => {
      event.preventDefault()
      const point = { x: event.pageX, y: event.pageY }
      setAnchorPoint(point)
      send("OPEN")
    },
    [send, setAnchorPoint],
  )

  useEffect(() => {
    document.addEventListener("contextmenu", handleContextMenu)
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
    }
  })

  return (
    <>
      <Global styles={menuStyle} />

      <ul ref={ref} className="menu__content" {...contextMenuProps}>
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
