import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine, Portal } from "@zag-js/react"
import { useId } from "react"
import styles from "../styles/machines/menu.module.css"

interface MenuProps extends Omit<menu.Props, "id"> {}

export function Menu(props: MenuProps) {
  const service = useMachine(menu.machine, {
    id: useId(),
    ...props,
  })

  const api = menu.connect(service, normalizeProps)

  return (
    <>
      <button className={styles.Trigger} {...api.getTriggerProps()}>
        Actions
        <span className={styles.Indicator} {...api.getIndicatorProps()}>
          ▾
        </span>
      </button>
      <Portal>
        <div {...api.getPositionerProps()}>
          <div className={styles.Content} {...api.getContentProps()}>
            {data.map((item) => (
              <div
                className={styles.Item}
                key={item.value}
                {...api.getItemProps({ value: item.value })}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </Portal>
    </>
  )
}

const data = [
  { label: "Edit", value: "edit" },
  { label: "Delete", value: "delete" },
  { label: "Export", value: "export" },
  { label: "Duplicate", value: "duplicate" },
]
