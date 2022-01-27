import { Global } from "@emotion/react"
import { Portal } from "@reach/portal"
import { mergeProps } from "@ui-machines/core"
import { nextTick } from "@ui-machines/dom-utils"
import * as Menu from "@ui-machines/menu"
import { useMachine, useSetup } from "@ui-machines/react"
import { useEffect } from "react"
import { menuData } from "../../../shared/data"
import { menuStyle } from "../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

export default function Page() {
  const [state, send, machine] = useMachine(Menu.machine)
  const rootRef = useSetup<HTMLButtonElement>({ send, id: "1" })

  const [subState, subSend, subMachine] = useMachine(Menu.machine)
  const subRef = useSetup<HTMLUListElement>({ send: subSend, id: "2" })

  const [sub2State, sub2Send, sub2Machine] = useMachine(Menu.machine)
  const sub2Ref = useSetup<HTMLUListElement>({ send: sub2Send, id: "3" })

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

  const [level1, level2, level3] = menuData

  return (
    <>
      <Global styles={menuStyle} />
      <button ref={rootRef} data-testid="trigger" {...root.triggerProps}>
        Click me
      </button>

      <Portal>
        <ul data-testid="menu" ref={subRef} {...root.contentProps}>
          {level1.map((item) => {
            const props = item.trigger ? triggerItemProps : root.getItemProps({ id: item.id })
            return (
              <li key={item.id} data-testid={item.id} {...props}>
                {item.label}
              </li>
            )
          })}
        </ul>
      </Portal>

      <Portal>
        <ul ref={sub2Ref} data-testid="more-tools-submenu" {...sub.contentProps}>
          {level2.map((item) => {
            const props = item.trigger ? triggerItem2Props : sub.getItemProps({ id: item.id })
            return (
              <li key={item.id} data-testid={item.id} {...props}>
                {item.label}
              </li>
            )
          })}
        </ul>
      </Portal>

      <Portal>
        <ul data-testid="open-nested-submenu" {...sub2.contentProps}>
          {level3.map((item) => (
            <li key={item.id} data-testid={item.id} {...sub2.getItemProps({ id: item.id })}>
              {item.label}
            </li>
          ))}
        </ul>
      </Portal>

      <StateVisualizer state={state} label="Root Machine" placement="left" />
      <StateVisualizer state={subState} label="Sub Machine" placement="left" offset="420px" />
      <StateVisualizer state={sub2State} label="Sub2 Machine" placement="left" offset="800px" />
    </>
  )
}
