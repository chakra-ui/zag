import { nextTick } from "@core-foundation/utils"
import { useMachine } from "@ui-machines/react"
import { menu, mergeProps } from "@ui-machines/web"
import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"
import { useEffect } from "react"
import { Styles } from "./menu"

export default function Page() {
  const [state, send, machine] = useMachine(menu.machine)
  const [subState, subSend, subMachine] = useMachine(menu.machine)
  const [sub2State, sub2Send, sub2Machine] = useMachine(menu.machine)

  const rootRef = useMount<HTMLButtonElement>(send)
  const subRef = useMount<HTMLLIElement>(subSend)
  const sub2Ref = useMount<HTMLLIElement>(sub2Send)

  const root = menu.connect(state, send)
  const sub = menu.connect(subState, subSend)
  const sub2 = menu.connect(sub2State, sub2Send)

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

  useEffect(() => {
    return nextTick(() => {
      sub.setChild(sub2Machine)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return nextTick(() => {
      sub2.setParent(subMachine)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const triggerItemProps = mergeProps(root.getItemProps({ id: sub.triggerProps.id }), sub.triggerProps)
  const triggerItem2Props = mergeProps(sub.getItemProps({ id: sub2.triggerProps.id }), sub2.triggerProps)

  return (
    <Styles>
      <button ref={rootRef} {...root.triggerProps}>
        Click me
      </button>

      <ul style={{ width: "300px" }} {...root.menuProps}>
        <div>
          <input
            data-valuetext="Command"
            {...root.getItemProps({ id: "input" })}
            placeholder="Command..."
            style={{ color: "white", width: "100%", boxSizing: "border-box" }}
          />
        </div>
        <li {...root.getItemProps({ id: "new-tab" })}>New Tab</li>
        <li {...root.getItemProps({ id: "new-win" })}>New Window</li>
        <li ref={subRef} {...triggerItemProps}>
          {`More Tools >`}{" "}
        </li>
        <li {...root.getItemProps({ id: "export" })}>Export</li>
        <a href="google.com" {...root.getItemProps({ id: "link" })}>
          Go to Google...
        </a>
      </ul>

      <ul style={{ width: "300px", left: "180px", top: "90px", position: "absolute" }} {...sub.menuProps}>
        <li {...sub.getItemProps({ id: "save-page" })}>Save Page As...</li>
        <li {...sub.getItemProps({ id: "shortcut" })}>Create Shortcuts</li>
        <li {...sub.getItemProps({ id: "name-win" })}>Name Window...</li>
        <li ref={sub2Ref} {...triggerItem2Props}>{`Open nested >`}</li>
        <li {...sub.getItemProps({ id: "switch-win" })}>Switch Window</li>
        <li {...sub.getItemProps({ id: "new-term" })}>New Terminal</li>
      </ul>

      <ul style={{ width: "300px", left: "352px", top: "170px", position: "absolute" }} {...sub2.menuProps}>
        <li {...sub2.getItemProps({ id: "welcome" })}>Welcome</li>
        <li {...sub2.getItemProps({ id: "play" })}>Playground</li>
        <li {...sub2.getItemProps({ id: "export" })}>Export</li>
      </ul>

      <StateVisualizer state={state} label="Root Machine" />
      <StateVisualizer state={subState} label="Sub Machine" style={{ right: 340 }} />
      <StateVisualizer state={sub2State} label="Sub2 Machine" style={{ left: 500 }} />
    </Styles>
  )
}
