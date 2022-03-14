import { injectGlobal } from "@emotion/css"
import { Portal } from "solid-js/web"
import { mergeProps } from "@ui-machines/core"
import { nextTick } from "@ui-machines/dom-utils"
import * as Menu from "@ui-machines/menu"
import { useMachine, useSetup, SolidPropTypes, normalizeProps } from "@ui-machines/solid"
import { StateVisualizer } from "../components/state-visualizer"
import { menuStyle } from "../../../../shared/style"
import { createMemo, For, onMount } from "solid-js"
import { menuData } from "../../../../shared/data"

injectGlobal(menuStyle)

export default function Page() {
  const [state, send, machine] = useMachine(Menu.machine)
  const rootRef = useSetup<HTMLUListElement>({ send, id: "1" })

  const [subState, subSend, subMachine] = useMachine(Menu.machine)
  const subRef = useSetup<HTMLUListElement>({ send: subSend, id: "2" })

  const [sub2State, sub2Send, sub2Machine] = useMachine(Menu.machine)
  const sub2Ref = useSetup<HTMLUListElement>({ send: sub2Send, id: "3" })

  const root = createMemo(() => Menu.connect<SolidPropTypes>(state, send, normalizeProps))
  const sub = createMemo(() => Menu.connect<SolidPropTypes>(subState, subSend, normalizeProps))
  const sub2 = createMemo(() => Menu.connect<SolidPropTypes>(sub2State, sub2Send, normalizeProps))

  onMount(() => {
    nextTick(() => {
      root().setChild(subMachine)
      sub().setParent(machine)
    })
  })

  onMount(() => {
    nextTick(() => {
      sub().setChild(sub2Machine)
      sub2().setParent(subMachine)
    })
  })

  const triggerItemProps = createMemo(() =>
    mergeProps(root().getItemProps({ id: sub().triggerProps.id }), sub().triggerProps),
  )
  const triggerItem2Props = createMemo(() =>
    mergeProps(sub().getItemProps({ id: sub2().triggerProps.id }), sub2().triggerProps),
  )

  const [level1, level2, level3] = menuData

  return (
    <>
      <button style={{ "margin-left": "150px" }} data-testid="trigger" {...root().triggerProps}>
        Click me
      </button>

      <Portal>
        <ul ref={rootRef} data-testid="menu" {...root().contentProps}>
          <For each={level1}>
            {(item) => {
              const props = createMemo(() => (item.trigger ? triggerItemProps() : root().getItemProps({ id: item.id })))
              return (
                <li data-testid={item.id} {...props()}>
                  {item.label}
                </li>
              )
            }}
          </For>
        </ul>
      </Portal>

      <Portal>
        <ul ref={subRef} data-testid="more-tools-submenu" {...sub().contentProps}>
          <For each={level2}>
            {(item) => {
              const props = createMemo(() => (item.trigger ? triggerItem2Props() : sub().getItemProps({ id: item.id })))
              return (
                <li data-testid={item.id} {...props}>
                  {item.label}
                </li>
              )
            }}
          </For>
        </ul>
      </Portal>

      <Portal>
        <ul ref={sub2Ref} data-testid="open-nested-submenu" {...sub2().contentProps}>
          <For each={level3}>
            {(item) => (
              <li data-testid={item.id} {...sub2().getItemProps({ id: item.id })}>
                {item.label}
              </li>
            )}
          </For>
        </ul>
      </Portal>

      <StateVisualizer state={state} label="Root Machine" placement="left" />
      <StateVisualizer state={subState} label="Sub Machine" placement="left" offset="420px" />
      <StateVisualizer state={sub2State} label="Sub2 Machine" placement="left" offset="800px" />
    </>
  )
}
