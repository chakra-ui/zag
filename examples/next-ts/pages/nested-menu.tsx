import { Global } from "@emotion/react"
import { Portal } from "@reach/portal"
import { mergeProps } from "@ui-machines/core"
import { nextTick } from "@ui-machines/dom-utils"
import * as Menu from "@ui-machines/menu"
import { useMachine } from "@ui-machines/react"
import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"
import { useEffect } from "react"
import { menuStyle } from "../../../shared/style"

export default function Page() {
  const [state, send, machine] = useMachine(Menu.machine)
  const [subState, subSend, subMachine] = useMachine(Menu.machine)
  const [sub2State, sub2Send, sub2Machine] = useMachine(Menu.machine)

  const rootRef = useMount<HTMLButtonElement>(send)
  const subRef = useMount<HTMLLIElement>(subSend)
  const sub2Ref = useMount<HTMLLIElement>(sub2Send)

  const root = Menu.connect(state, send)
  const sub = Menu.connect(subState, subSend)
  const sub2 = Menu.connect(sub2State, sub2Send)

  useEffect(() => {
    return nextTick(() => {
      root.setChild(subMachine)
      sub.setParent(machine)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return nextTick(() => {
      sub.setChild(sub2Machine)
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

      <Portal>
        <ul data-testid="menu" {...root.contentProps}>
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
          <li data-testid="export" {...root.getItemProps({ id: "export" })}>
            Export
          </li>
          <a href="google.com" data-testid="google" {...root.getItemProps({ id: "link" })}>
            Go to Google...
          </a>
        </ul>
      </Portal>

      <Portal>
        <ul data-testid="more-tools-submenu" {...sub.contentProps}>
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
      </Portal>

      <Portal>
        <ul data-testid="open-nested-submenu" {...sub2.contentProps}>
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
      </Portal>

      <StateVisualizer state={state} label="Root Machine" style={{ maxWidth: 320 }} />
      <StateVisualizer state={subState} label="Sub Machine" style={{ maxWidth: 320, left: 420 }} />
      <StateVisualizer state={sub2State} label="Sub2 Machine" style={{ maxWidth: 320, left: 800 }} />
    </>
  )
}
