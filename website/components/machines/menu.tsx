import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine, Portal } from "@zag-js/react"
import { panda } from "styled-system/jsx"
import { Button } from "components/button"
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
      {/* @ts-expect-error */}
      <Button size="sm" variant="green" {...api.triggerProps}>
        Actions{" "}
        <panda.span ml="2" aria-hidden>
          ▾
        </panda.span>
      </Button>
      <Portal>
        <div {...api.positionerProps}>
          <panda.ul
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
              <panda.li
                px="2"
                py="1"
                cursor="pointer"
                key={item.value}
                _focus={{
                  bg: "bg-primary-bold",
                  color: "white",
                }}
                {...api.getItemProps({ id: item.value })}
              >
                {item.label}
              </panda.li>
            ))}
          </panda.ul>
        </div>
      </Portal>
    </div>
  )
}
