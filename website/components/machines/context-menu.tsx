import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

const data = [
  { label: "Edit", value: "edit" },
  { label: "Delete", value: "delete" },
  { label: "Export", value: "export" },
  { label: "Duplicate", value: "duplicate" },
]

type ContextMenuProps = {
  controls: {}
}

export function ContextMenu(props: ContextMenuProps) {
  const [state, send] = useMachine(menu.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = menu.connect(state, send, normalizeProps)

  return (
    <div>
      <div {...api.contextTriggerProps}>
        <div>Open context menu</div>
      </div>
      <div {...api.positionerProps}>
        <ul {...api.contentProps}>
          {data.map((item) => (
            <li key={item.value} {...api.getItemProps({ id: item.value })}>
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
