import { Global } from "@emotion/react"
import { Portal } from "@reach/portal"
import * as menu from "@zag-js/menu"
import { useMachine, useSetup } from "@zag-js/react"
import { useEffect } from "react"
import { menuData } from "../../../shared/data"
import { menuStyle } from "../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

export default function Page() {
  const [state, send, machine] = useMachine(menu.machine)
  const rootRef = useSetup<HTMLUListElement>({ send, id: "1" })
  const root = menu.connect(state, send)

  const [subState, subSend, subMachine] = useMachine(menu.machine)
  const subRef = useSetup<HTMLUListElement>({ send: subSend, id: "2" })
  const sub = menu.connect(subState, subSend)

  const [sub2State, sub2Send, sub2Machine] = useMachine(menu.machine)
  const sub2Ref = useSetup<HTMLUListElement>({ send: sub2Send, id: "3" })
  const sub2 = menu.connect(sub2State, sub2Send)

  useEffect(() => {
    setTimeout(() => {
      root.setChild(subMachine)
      sub.setParent(machine)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setTimeout(() => {
      sub.setChild(sub2Machine)
      sub2.setParent(subMachine)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const triggerItemProps = root.getTriggerItemProps(sub)
  const triggerItem2Props = sub.getTriggerItemProps(sub2)

  const [level1, level2, level3] = menuData

  return (
    <>
      <Global styles={menuStyle} />
      <main>
        <button data-testid="trigger" {...root.triggerProps}>
          Click me
        </button>
        <Portal>
          <div {...root.positionerProps}>
            <ul data-testid="menu" ref={rootRef} {...root.contentProps}>
              {level1.map((item) => {
                const props = item.trigger ? triggerItemProps : root.getItemProps({ id: item.id })
                return (
                  <li key={item.id} data-testid={item.id} {...props}>
                    {item.label}
                  </li>
                )
              })}
            </ul>
          </div>
        </Portal>
        <Portal>
          <div {...sub.positionerProps}>
            <ul ref={subRef} data-testid="more-tools-submenu" {...sub.contentProps}>
              {level2.map((item) => {
                const props = item.trigger ? triggerItem2Props : sub.getItemProps({ id: item.id })
                return (
                  <li key={item.id} data-testid={item.id} {...props}>
                    {item.label}
                  </li>
                )
              })}
            </ul>
          </div>
        </Portal>
        <Portal>
          <div {...sub2.positionerProps}>
            <ul ref={sub2Ref} data-testid="open-nested-submenu" {...sub2.contentProps}>
              {level3.map((item) => (
                <li key={item.id} data-testid={item.id} {...sub2.getItemProps({ id: item.id })}>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </Portal>
        <div style={{ position: "relative" }}>
          <StateVisualizer state={state} label="Root Machine" placement="left" />
          <StateVisualizer state={subState} label="Sub Machine" placement="left" offset="420px" />
          <StateVisualizer state={sub2State} label="Sub2 Machine" placement="left" offset="800px" />
        </div>
      </main>
    </>
  )
}
