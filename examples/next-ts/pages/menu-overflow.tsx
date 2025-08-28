import * as menu from "@zag-js/menu"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

const items = Array.from({ length: 40 }, (_, i) => ({
  label: `Item ${i}`,
  value: `item-${i}`,
}))

export default function Page() {
  const service = useMachine(menu.machine, { id: useId() })
  const api = menu.connect(service, normalizeProps)
  return (
    <main>
      <div>
        <button {...api.getTriggerProps()}>
          Actions <span {...api.getIndicatorProps()}>▾</span>
        </button>
        {api.open && (
          <div {...api.getPositionerProps()}>
            <ul {...mergeProps(api.getContentProps(), { style: { maxHeight: "300px", overflowY: "auto" } })}>
              {items.map((item) => (
                <li key={item.value} {...api.getItemProps({ value: item.value })}>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  )
}
