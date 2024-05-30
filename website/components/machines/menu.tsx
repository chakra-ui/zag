import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine, Portal } from "@zag-js/react"
import { useId } from "react"

const data = [
  { label: "Edit", value: "edit" },
  { label: "Delete", value: "delete" },
  { label: "Export", value: "export" },
  { label: "Duplicate", value: "duplicate" },
]

type MenuProps = {
  controls: {}
}

export function Menu(props: MenuProps) {
  const [state, send] = useMachine(menu.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = menu.connect(state, send, normalizeProps)

  return (
    <div>
      <button {...api.getTriggerProps()}>
        Actions <span {...api.getIndicatorProps()}>▾</span>
      </button>
      <Portal>
        <div {...api.getPositionerProps()}>
          <ul {...api.getContentProps()}>
            {data.map((item) => (
              <li key={item.value} {...api.getItemProps({ value: item.value })}>
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </Portal>
    </div>
  )
}
