import * as menu from "@zag-js/menu"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import { For, Show, createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/menu.css"

const items = [
  ...Array.from({ length: 20 }, (_, i) => ({ label: `Item ${i}`, value: `item-${i}` })),
  { label: "Zebra", value: "zebra" },
  ...Array.from({ length: 20 }, (_, i) => ({ label: `Item ${i + 20}`, value: `item-${i + 20}` })),
]

export default function Page() {
  const service = useMachine(menu.machine, { id: createUniqueId() })
  const api = createMemo(() => menu.connect(service, normalizeProps))
  return (
    <main style={{ padding: "40px" }}>
      <p style={{ "margin-bottom": "16px", color: "#666" }}>
        Use keyboard: open with Enter/Space, then ArrowDown to navigate. The highlighted item should scroll into view.
      </p>
      <div>
        <button {...api().getTriggerProps()}>
          Actions <span {...api().getIndicatorProps()}>▾</span>
        </button>
        <Show when={api().open}>
          <Portal>
            <div {...api().getPositionerProps()}>
              <ul {...mergeProps(api().getContentProps(), { style: { "max-height": "200px", "overflow-y": "auto" } })}>
                <For each={items}>{(item) => <li {...api().getItemProps({ value: item.value })}>{item.label}</li>}</For>
              </ul>
            </div>
          </Portal>
        </Show>
      </div>
    </main>
  )
}
