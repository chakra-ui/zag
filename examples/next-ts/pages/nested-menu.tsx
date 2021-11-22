import { useMachine } from "@ui-machines/react"
import { menu } from "@ui-machines/menu"
import { mergeProps } from "@ui-machines/core"
// import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"
import { useEffect } from "react"
import { nextTick } from "@ui-machines/dom-utils"
import { menuStyle } from "../../../shared/style"
import { Global } from "@emotion/react"

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
    <>
      <Global styles={menuStyle} />
      <button ref={rootRef} data-testid="trigger" {...root.triggerProps}>
        Click me
      </button>

      <ul style={{ width: "300px" }} data-testid="menu" {...root.menuProps}>
        <li data-testid="new-file" {...root.getItemProps({ id: "new-file" })}>
          New File
        </li>
        <li data-testid="new-tab" {...root.getItemProps({ id: "new-tab" })}>
          New Tab
        </li>
        <li data-testid="new-win" {...root.getItemProps({ id: "new-win" })}>
          New Window
        </li>
        <li data-testid="more-tools" ref={subRef} {...triggerItemProps}>
          {`More Tools →`}
        </li>
        <li data-testid="export " {...root.getItemProps({ id: "export", disabled: true })}>
          Export
        </li>
        <a href="google.com" data-testid="google" {...root.getItemProps({ id: "link" })}>
          Go to Google...
        </a>
      </ul>

      <ul
        data-testid="more-tools-submenu"
        style={{ width: "300px", left: "180px", top: "90px", position: "absolute" }}
        {...sub.menuProps}
      >
        <li data-testid="save-page" {...sub.getItemProps({ id: "save-page" })}>
          Save Page As...
        </li>
        <li data-testid="shortcut" {...sub.getItemProps({ id: "shortcut" })}>
          Create Shortcuts
        </li>
        <li data-testid="name-win" {...sub.getItemProps({ id: "name-win" })}>
          Name Window...
        </li>
        <li data-testid="open-nested" ref={sub2Ref} {...triggerItem2Props}>{`Open nested →`}</li>
        <li data-testid="switch-win" {...sub.getItemProps({ id: "switch-win" })}>
          Switch Window
        </li>
        <li data-testid="new-term" {...sub.getItemProps({ id: "new-term" })}>
          New Terminal
        </li>
      </ul>

      <ul
        data-testid="open-nested-submenu"
        style={{ width: "300px", left: "352px", top: "170px", position: "absolute" }}
        {...sub2.menuProps}
      >
        <li data-testid="welcome" {...sub2.getItemProps({ id: "welcome" })}>
          Welcome
        </li>
        <li data-testid="playground" {...sub2.getItemProps({ id: "playground" })}>
          Playground
        </li>
        <li data-testid="export" {...sub2.getItemProps({ id: "export" })}>
          Export
        </li>
      </ul>

      {/* <StateVisualizer state={state} label="Root Machine" style={{ maxWidth: 320 }} />
      <StateVisualizer state={subState} label="Sub Machine" style={{ maxWidth: 320, right: 420 }} />
      <StateVisualizer state={sub2State} label="Sub2 Machine" style={{ maxWidth: 320, right: 800 }} /> */}
    </>
  )
}
