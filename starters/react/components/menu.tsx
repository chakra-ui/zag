import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { cloneElement, isValidElement, useId } from "react"

interface Props extends Omit<menu.Context, "id" | "open.controlled"> {
  defaultOpen?: boolean
  children: React.ReactNode
  items: Array<{ value: string; label: React.ReactNode }>
}

export function Menu(props: Props) {
  const { defaultOpen, open, items, children, ...context } = props

  const [state, send] = useMachine(
    menu.machine({
      id: useId(),
      open: open ?? defaultOpen,
    }),
    {
      context: {
        ...context,
        open,
        "open.controlled": open !== undefined,
      },
    },
  )

  const api = menu.connect(state, send, normalizeProps)

  return (
    <div>
      {isValidElement(children) ? cloneElement(children, api.getTriggerProps()) : children}
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
    </div>
  )
}
