import * as menu from "@zag-js/menu"
import { menuData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, createMemo, createUniqueId, onMount } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"

export default function Page() {
  const service = useMachine(menu.machine, { id: createUniqueId() })
  const root = createMemo(() => menu.connect(service, normalizeProps))

  const subService = useMachine(menu.machine, { id: createUniqueId() })
  const sub = createMemo(() => menu.connect(subService, normalizeProps))

  const sub2Service = useMachine(menu.machine, { id: createUniqueId() })
  const sub2 = createMemo(() => menu.connect(sub2Service, normalizeProps))

  onMount(() => {
    root().setChild(subService)
    sub().setParent(service)
  })

  onMount(() => {
    sub().setChild(sub2Service)
    sub2().setParent(subService)
  })

  const triggerItemProps = createMemo(() => root().getTriggerItemProps(sub()))
  const triggerItem2Props = createMemo(() => sub().getTriggerItemProps(sub2()))

  const [level1, level2, level3] = menuData

  return (
    <>
      <main>
        <div>
          <button data-testid="trigger" {...root().getTriggerProps()}>
            Click me
          </button>

          <Portal>
            <div {...root().getPositionerProps()}>
              <ul data-testid="menu" {...root().getContentProps()}>
                <For each={level1}>
                  {(item) => {
                    const props = createMemo(() =>
                      item.trigger ? triggerItemProps() : root().getItemProps({ value: item.value }),
                    )

                    return (
                      <li data-testid={item.value} {...props()}>
                        {item.label}
                      </li>
                    )
                  }}
                </For>
              </ul>
            </div>
          </Portal>

          <Portal>
            <div {...sub().getPositionerProps()}>
              <ul data-testid="more-tools-submenu" {...sub().getContentProps()}>
                <For each={level2}>
                  {(item) => {
                    const props = createMemo(() =>
                      item.trigger ? triggerItem2Props() : sub().getItemProps({ value: item.value }),
                    )
                    return (
                      <li data-testid={item.value} {...props}>
                        {item.label}
                      </li>
                    )
                  }}
                </For>
              </ul>
            </div>
          </Portal>

          <Portal>
            <div {...sub2().getPositionerProps()}>
              <ul data-testid="open-nested-submenu" {...sub2().getContentProps()}>
                <For each={level3}>
                  {(item) => (
                    <li data-testid={item.value} {...sub2().getItemProps({ value: item.value })}>
                      {item.label}
                    </li>
                  )}
                </For>
              </ul>
            </div>
          </Portal>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} context={["currentPlacement", "highlightedValue"]} />
        <StateVisualizer state={subService} />
        <StateVisualizer state={sub2Service} />
      </Toolbar>
    </>
  )
}
