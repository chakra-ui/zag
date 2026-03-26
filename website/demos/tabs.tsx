import { normalizeProps, useMachine } from "@zag-js/react"
import * as tabs from "@zag-js/tabs"
import { useId } from "react"
import styles from "../styles/machines/tabs.module.css"

interface TabsProps extends Omit<tabs.Props, "id"> {}

export function Tabs(props: TabsProps) {
  const service = useMachine(tabs.machine, {
    id: useId(),
    defaultValue: "item-1",
    ...props,
  })

  const api = tabs.connect(service, normalizeProps)

  return (
    <div className={styles.Root}>
      <div className={styles.List} {...api.getListProps()}>
        {data.map((item) => (
          <button
            className={styles.Trigger}
            {...api.getTriggerProps({ value: item.value })}
            key={item.value}
          >
            {item.label}
          </button>
        ))}
      </div>
      {data.map((item) => (
        <div
          className={styles.Content}
          {...api.getContentProps({ value: item.value })}
          key={item.value}
        >
          <p>{item.content}</p>
        </div>
      ))}
    </div>
  )
}

const data = [
  { value: "item-1", label: "Item one", content: "Item one content" },
  { value: "item-2", label: "Item two", content: "Item two content" },
  { value: "item-3", label: "Item three", content: "Item three content" },
]
