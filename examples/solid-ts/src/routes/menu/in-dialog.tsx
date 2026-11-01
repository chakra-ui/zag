import * as dialog from "@zag-js/dialog"
import * as menu from "@zag-js/menu"
import { menuData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { XIcon } from "lucide-solid"
import { For, Show, createMemo, createUniqueId, onMount } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/menu.css"
import "@styles/dialog.css"

function NestedMenu() {
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
    <div>
      <button {...root().getTriggerProps()}>Options Menu</button>

      <Show when={root().open}>
        <Portal>
          <div {...root().getPositionerProps()}>
            <ul {...root().getContentProps()}>
              <For each={level1}>
                {(item) => {
                  const props = createMemo(() =>
                    item.trigger ? triggerItemProps() : root().getItemProps({ value: item.value }),
                  )
                  return <li {...props()}>{item.label}</li>
                }}
              </For>
            </ul>
          </div>
        </Portal>
      </Show>

      <Show when={sub().open}>
        <Portal>
          <div {...sub().getPositionerProps()}>
            <ul {...sub().getContentProps()}>
              <For each={level2}>
                {(item) => {
                  const props = createMemo(() =>
                    item.trigger ? triggerItem2Props() : sub().getItemProps({ value: item.value }),
                  )
                  return <li {...props()}>{item.label}</li>
                }}
              </For>
            </ul>
          </div>
        </Portal>
      </Show>

      <Show when={sub2().open}>
        <Portal>
          <div {...sub2().getPositionerProps()}>
            <ul {...sub2().getContentProps()}>
              <For each={level3}>{(item) => <li {...sub2().getItemProps({ value: item.value })}>{item.label}</li>}</For>
            </ul>
          </div>
        </Portal>
      </Show>
    </div>
  )
}

export default function Page() {
  const service = useMachine(dialog.machine, { id: createUniqueId() })
  const api = createMemo(() => dialog.connect(service, normalizeProps))

  return (
    <div style={{ padding: "20px" }}>
      <button {...api().getTriggerProps()} data-testid="trigger-1">
        Open Dialog with Nested Menu
      </button>
      <Show when={api().open}>
        <Portal>
          <div {...api().getBackdropProps()} />
          <div data-testid="positioner-1" {...api().getPositionerProps()}>
            <div {...api().getContentProps()}>
              <h2 {...api().getTitleProps()}>Dialog with Nested Menu</h2>
              <p {...api().getDescriptionProps()}>
                This dialog contains a menu with multiple nested submenus. The focus trap should include all menu
                levels, even though they are portalled.
              </p>
              <div style={{ "margin-top": "20px" }}>
                <NestedMenu />
              </div>
              <div style={{ "margin-top": "20px", display: "flex", gap: "10px", "justify-content": "flex-end" }}>
                <button {...api().getCloseTriggerProps()}>
                  <XIcon />
                </button>
              </div>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  )
}
