import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

interface ContextMenuProps extends Omit<menu.Props, "id"> {}

export function ContextMenu(props: ContextMenuProps) {
  const service = useMachine(menu.machine, {
    id: useId(),
    ...props,
  })

  const api = menu.connect(service, normalizeProps)

  return (
    <div>
      <div {...api.getContextTriggerProps()}>
        <div>Open context menu</div>
      </div>
      <div {...api.getPositionerProps()}>
        <ul {...api.getContentProps()}>
          {data.map((item) => (
            <li key={item.value} {...api.getItemProps({ value: item.value })}>
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const data = [
  { label: "Edit", value: "edit" },
  { label: "Delete", value: "delete" },
  { label: "Export", value: "export" },
  { label: "Duplicate", value: "duplicate" },
]
