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

export function NestedMenu() {
  // Level 1 - File Menu
  const [fileMenuState, fileMenuSend, fileMenuMachine] = useMachine(
    menu.machine({ id: "1", "aria-label": "File" }),
  )

  const fileMenu = menu.connect(fileMenuState, fileMenuSend, normalizeProps)

  // Level 2 - Share Menu
  const [shareMenuState, shareMenuSend, shareMenuMachine] = useMachine(
    menu.machine({ id: "2", "aria-label": "Share" }),
  )

  const shareMenu = menu.connect(shareMenuState, shareMenuSend, normalizeProps)

  useEffect(() => {
    setTimeout(() => {
      fileMenu.setChild(shareMenuMachine)
      shareMenu.setParent(fileMenuMachine)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Share menu trigger
  const shareMenuTriggerProps = fileMenu.getTriggerItemProps(shareMenu)

  return (
    <div>
      <button {...fileMenu.triggerProps}>
        Click me
        <span {...fileMenu.indicatorProps}>▾</span>
      </button>

      <Portal>
        <div {...fileMenu.positionerProps}>
          <ul {...fileMenu.contentProps}>
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
              <span {...shareMenu.indicatorProps}>»</span>
            </li>
          </ul>
        </div>
      </Portal>

      <Portal>
        <div {...shareMenu.positionerProps}>
          <ul {...shareMenu.contentProps}>
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
