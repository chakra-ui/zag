import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId } from "react"

const items = [
  { label: "Copy", value: "copy" },
  { label: "Éditer", value: "edit" },
  { label: "Öffnen", value: "open" },
  { label: "Экспорт", value: "export" },
  { label: "Διαγραφή", value: "delete" },
]

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
          <Portal>
            <div {...api.getPositionerProps()}>
              <ul {...api.getContentProps()}>
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
