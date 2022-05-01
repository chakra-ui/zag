import { injectGlobal } from "@emotion/css"
import * as menu from "@zag-js/menu"
import { normalizeProps, PropTypes, useMachine, useSetup } from "@zag-js/solid"
import { createMemo, createUniqueId, For, onMount } from "solid-js"
import { Portal } from "solid-js/web"
import { menuData } from "../../../../shared/data"
import { menuStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

injectGlobal(menuStyle)

export default function Page() {
  const [state, send, machine] = useMachine(menu.machine)
  const rootRef = useSetup<HTMLUListElement>({ send, id: createUniqueId() })
  const root = createMemo(() => menu.connect<PropTypes>(state, send, normalizeProps))

  const [subState, subSend, subMachine] = useMachine(menu.machine)
  const subRef = useSetup<HTMLUListElement>({ send: subSend, id: createUniqueId() })
  const sub = createMemo(() => menu.connect<PropTypes>(subState, subSend, normalizeProps))

  const [sub2State, sub2Send, sub2Machine] = useMachine(menu.machine)
  const sub2Ref = useSetup<HTMLUListElement>({ send: sub2Send, id: createUniqueId() })
  const sub2 = createMemo(() => menu.connect<PropTypes>(sub2State, sub2Send, normalizeProps))

  onMount(() => {
    setTimeout(() => {
      root().setChild(subMachine)
      sub().setParent(machine)
    })
  })

  onMount(() => {
    setTimeout(() => {
      sub().setChild(sub2Machine)
      sub2().setParent(subMachine)
    })
  })

  const triggerItemProps = createMemo(() => root().getTriggerItemProps(sub()))
  const triggerItem2Props = createMemo(() => sub().getTriggerItemProps(sub2()))

  const [level1, level2, level3] = menuData

  return (
    <>
      <main>
        <button data-testid="trigger" {...root().triggerProps}>
          Click me
        </button>

        <Portal>
          <div {...root().positionerProps}>
            <ul ref={rootRef} data-testid="menu" {...root().contentProps}>
              <For each={level1}>
                {(item) => {
                  const props = createMemo(() =>
                    item.trigger ? triggerItemProps() : root().getItemProps({ id: item.id }),
                  )
                  return (
                    <li data-testid={item.id} {...props()}>
                      {item.label}
                    </li>
                  )
                }}
              </For>
            </ul>
          </div>
        </Portal>

        <Portal>
          <div {...sub().positionerProps}>
            <ul ref={subRef} data-testid="more-tools-submenu" {...sub().contentProps}>
              <For each={level2}>
                {(item) => {
                  const props = createMemo(() =>
                    item.trigger ? triggerItem2Props() : sub().getItemProps({ id: item.id }),
                  )
                  return (
                    <li data-testid={item.id} {...props}>
                      {item.label}
                    </li>
                  )
                }}
              </For>
            </ul>
          </div>
        </Portal>

        <Portal>
          <div {...sub2().positionerProps}>
            <ul ref={sub2Ref} data-testid="open-nested-submenu" {...sub2().contentProps}>
              <For each={level3}>
                {(item) => (
                  <li data-testid={item.id} {...sub2().getItemProps({ id: item.id })}>
                    {item.label}
                  </li>
                )}
              </For>
            </ul>
          </div>
        </Portal>
      </main>

      <Toolbar
        controls={null}
        count={3}
        visualizer={
          <>
            <StateVisualizer state={state} />
            <StateVisualizer state={subState} />
            <StateVisualizer state={sub2State} />
          </>
        }
      />
    </>
  )
}
