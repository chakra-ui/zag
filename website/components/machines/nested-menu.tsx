import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine, Portal } from "@zag-js/react"
import { useEffect } from "react"

const data = [
  { label: "New tab", value: "new-tab" },
  { label: "New window", value: "new-window" },
  { label: "Print ...", value: "print" },
  { label: "Help", value: "help" },
]

const shareMenuData = [
  { label: "Messages", value: "messages" },
  { label: "Airdrop", value: "airdrop" },
  { label: "WhatsApp", value: "whatsapp" },
]

export function NestedMenu(props: Omit<menu.Props, "id">) {
  // Level 1 - File Menu
  const fileMenuService = useMachine(menu.machine, {
    id: "1",
    "aria-label": "File",
    ...props,
  })

  const fileMenu = menu.connect(fileMenuService, normalizeProps)

  // Level 2 - Share Menu
  const shareMenuService = useMachine(menu.machine, {
    id: "2",
    "aria-label": "Share",
  })

  const shareMenu = menu.connect(shareMenuService, normalizeProps)

  useEffect(() => {
    setTimeout(() => {
      fileMenu.setChild(shareMenuService)
      shareMenu.setParent(fileMenuService)
    })
  }, [])

  // Share menu trigger
  const shareMenuTriggerProps = fileMenu.getTriggerItemProps(shareMenu)

  return (
    <div>
      <button {...fileMenu.getTriggerProps()}>
        Click me
        <span {...fileMenu.getIndicatorProps()}>▾</span>
      </button>

      <Portal>
        <div {...fileMenu.getPositionerProps()}>
          <ul {...fileMenu.getContentProps()}>
            {data.map((item) => (
              <li
                key={item.value}
                {...fileMenu.getItemProps({ value: item.value })}
              >
                {item.label}
              </li>
            ))}
            <li {...shareMenuTriggerProps}>
              Share
              <span {...shareMenu.getIndicatorProps()}>»</span>
            </li>
          </ul>
        </div>
      </Portal>

      <Portal>
        <div {...shareMenu.getPositionerProps()}>
          <ul {...shareMenu.getContentProps()}>
            {shareMenuData.map((item) => (
              <li
                key={item.value}
                {...shareMenu.getItemProps({ value: item.value })}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </Portal>
    </div>
  )
}
