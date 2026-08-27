import * as menu from "@zag-js/menu"
import { mergeProps, normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId } from "react"

const items = [
  ...Array.from({ length: 20 }, (_, i) => ({ label: `Item ${i}`, value: `item-${i}` })),
  { label: "Zebra", value: "zebra" },
  ...Array.from({ length: 20 }, (_, i) => ({ label: `Item ${i + 20}`, value: `item-${i + 20}` })),
]

export default function Page() {
  const service = useMachine(menu.machine, { id: useId() })
  const api = menu.connect(service, normalizeProps)
  return (
    <main style={{ padding: 40 }}>
      <p style={{ marginBottom: 16, color: "#666" }}>
        Use keyboard: open with Enter/Space, then ArrowDown to navigate. The highlighted item should scroll into view.
      </p>
      <div>
        <button {...api.getTriggerProps()}>
          Actions <span {...api.getIndicatorProps()}>▾</span>
        </button>
        {api.open && (
          <Portal>
            <div {...api.getPositionerProps()}>
              <ul
                {...mergeProps(api.getContentProps(), {
                  style: { maxHeight: "200px", overflowY: "auto" as const },
                })}
              >
                {items.map((item) => (
                  <li key={item.value} {...api.getItemProps({ value: item.value })}>
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>
          </Portal>
        )}
      </div>
    </main>
  )
}
