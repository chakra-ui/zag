import { nextTick } from "@core-foundation/utils"
import { useMachine } from "@ui-machines/react"
import { menu, mergeProps } from "@ui-machines/web"
import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"
import { useEffect } from "react"
import { Styles } from "./menu"

export default function Page() {
  const [state, send, machine] = useMachine(menu.machine.withContext({}))
  const [subState, subSend, subMachine] = useMachine(menu.machine.withContext({}))

  const rootRef = useMount<HTMLButtonElement>(send)
  const subRef = useMount<HTMLLIElement>(subSend)

  const root = menu.connect(state, send)
  const sub = menu.connect(subState, subSend)

  useEffect(() => {
    return nextTick(() => {
      root.setChild(subMachine)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return nextTick(() => {
      sub.setParent(machine)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const triggerItemProps = mergeProps(root.getItemProps({ id: sub.triggerProps.id }), sub.triggerProps)

  return (
    <Styles>
      <StateVisualizer state={state} label="Root Machine" />
      <StateVisualizer state={subState} label="Sub Machine" style={{ left: 400, maxWidth: 320 }} />
      <button ref={rootRef} {...root.triggerProps}>
        Click me
      </button>
      <ul style={{ width: 300 }} {...root.menuProps}>
        <li {...root.getItemProps({ id: "new-tab" })}>New Tab</li>
        <li {...root.getItemProps({ id: "new-win" })}>New Window</li>
        <li ref={subRef} {...triggerItemProps}>
          {`More Tools >`}{" "}
        </li>
        <li {...root.getItemProps({ id: "export" })}>Export</li>
      </ul>
      <ul style={{ width: 300, left: 180, top: 90, position: "absolute" }} {...sub.menuProps}>
        <li {...sub.getItemProps({ id: "save-page" })}>Save Page As...</li>
        <li {...sub.getItemProps({ id: "shortcut" })}>Create Shortcuts</li>
        <li {...sub.getItemProps({ id: "name-win" })}>Name Window...</li>
      </ul>
    </Styles>
  )
}
