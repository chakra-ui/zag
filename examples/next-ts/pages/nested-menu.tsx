import { Global } from "@emotion/react"
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/react"
import { menuData, menuStyle } from "@zag-js/shared"
import { useEffect, useId } from "react"
import { Portal } from "../components/portal"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const [state, send, machine] = useMachine(
    menu.machine({
      id: useId(),
    }),
  )
  const root = menu.connect(state, send, normalizeProps)

  const [subState, subSend, subMachine] = useMachine(
    menu.machine({
      id: useId(),
    }),
  )
  const sub = menu.connect(subState, subSend, normalizeProps)

  const [sub2State, sub2Send, sub2Machine] = useMachine(
    menu.machine({
      id: useId(),
    }),
  )
  const sub2 = menu.connect(sub2State, sub2Send, normalizeProps)

  useEffect(() => {
    root.setChild(subMachine)
    sub.setParent(machine)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    sub.setChild(sub2Machine)
    sub2.setParent(subMachine)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const triggerItemProps = root.getTriggerItemProps(sub)
  const triggerItem2Props = sub.getTriggerItemProps(sub2)

  const [level1, level2, level3] = menuData

  return (
    <>
      <Global styles={menuStyle} />

      <main>
        <div>
          <button data-testid="trigger" {...root.triggerProps}>
            Click me
          </button>

          <Portal>
            <div {...root.positionerProps}>
              <ul data-testid="menu" {...root.contentProps}>
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
              <ul data-testid="more-tools-submenu" {...sub.contentProps}>
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
              <ul data-testid="open-nested-submenu" {...sub2.contentProps}>
                {level3.map((item) => (
                  <li key={item.id} data-testid={item.id} {...sub2.getItemProps({ id: item.id })}>
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>
          </Portal>
        </div>
      </main>

      <Toolbar controls={null} count={3}>
        <StateVisualizer state={state} label="Root Machine" />
        <StateVisualizer state={subState} label="Sub Machine" />
        <StateVisualizer state={sub2State} label="Sub2 Machine" />
      </Toolbar>
    </>
  )
}
