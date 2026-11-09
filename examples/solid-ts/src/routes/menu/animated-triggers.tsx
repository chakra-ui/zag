import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, createMemo, createUniqueId } from "solid-js"
import { Portal } from "@solidjs/web"
import { Presence } from "~/components/presence"
import "@styles/menu-viewport.css"

const menus = [
  { value: "file", label: "File", items: ["New file", "Open…", "Save", "Save as…"] },
  { value: "edit", label: "Edit", items: ["Undo", "Redo", "Cut", "Copy", "Paste"] },
  { value: "view", label: "View", items: ["Zoom in", "Zoom out", "Toggle full screen mode"] },
]

export default function Page() {
  const service = useMachine(menu.machine, {
    id: createUniqueId(),
    positioning: { placement: "bottom-start" },
  })

  const api = createMemo(() => menu.connect(service, normalizeProps))

  return (
    <main class="menu animated-triggers">
      <div class="animated-triggers__list">
        <For each={menus}>
          {(item) => <button {...api().getTriggerProps({ value: item.value })}>{item.label}</button>}
        </For>
      </div>

      <Portal>
        <div {...api().getPositionerProps()}>
          <Presence {...api().getArrowProps()}>
            <div {...api().getArrowTipProps()} />
          </Presence>
          <Presence {...api().getViewportProps()}>
            <For each={menus}>
              {(item) => (
                <Presence {...api().getContentProps({ value: item.value })}>
                  <For each={item.items}>
                    {(label) => <div {...api().getItemProps({ value: `${item.value}:${label}` })}>{label}</div>}
                  </For>
                </Presence>
              )}
            </For>
          </Presence>
        </div>
      </Portal>
    </main>
  )
}
