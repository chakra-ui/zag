import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine, Portal } from "@zag-js/react"
import { useEffect } from "react"
import styles from "../styles/machines/menu.module.css"

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
  const fileMenuService = useMachine(menu.machine, {
    id: "1",
    "aria-label": "File",
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
      <button className={styles.Trigger} {...fileMenu.getTriggerProps()}>
        Click me
        <span {...fileMenu.getIndicatorProps()}>▾</span>
      </button>

      <Portal>
        <div {...fileMenu.getPositionerProps()}>
          <ul className={styles.Content} {...fileMenu.getContentProps()}>
            {data.map((item) => (
              <li
                className={styles.Item}
                key={item.value}
                {...fileMenu.getItemProps({ value: item.value })}
              >
                {item.label}
              </li>
            ))}
            <li className={styles.TriggerItem} {...shareMenuTriggerProps}>
              Share
              <span {...shareMenu.getIndicatorProps()}>»</span>
            </li>
          </ul>
        </div>
      </Portal>

      <Portal>
        <div {...shareMenu.getPositionerProps()}>
          <ul className={styles.Content} {...shareMenu.getContentProps()}>
            {shareMenuData.map((item) => (
              <li
                className={styles.Item}
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
