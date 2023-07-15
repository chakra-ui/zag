import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/react"
import { chakra } from "@chakra-ui/system"
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
      <chakra.div bg="bg-subtle" p="4" {...api.contextTriggerProps}>
        <div>Open context menu</div>
      </chakra.div>
      <div {...api.positionerProps}>
        <chakra.ul
          bg="bg-subtle"
          width="240px"
          padding="2"
          isolation="isolate"
          listStyleType="none"
          shadow="base"
          className="focus-outline"
          {...api.contentProps}
        >
          {data.map((item) => (
            <chakra.li
              px="2"
              py="1"
              cursor="pointer"
              key={item.value}
              _highlighted={{
                bg: "bg-primary-bold",
                color: "white",
              }}
              {...api.getItemProps({ id: item.value })}
            >
              {item.label}
            </chakra.li>
          ))}
        </chakra.ul>
      </div>
    </div>
  )
}
