import * as radio from "@zag-js/radio-group"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import styles from "../styles/machines/segmented-control.module.css"

interface SegmentedControlProps extends Omit<radio.Props, "id"> {}

export function SegmentedControl(props: SegmentedControlProps) {
  const service = useMachine(radio.machine, {
    id: useId(),
    defaultValue: "react",
    orientation: "horizontal",
    ...props,
  })

  const api = radio.connect(service, normalizeProps)

  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <div className={styles.Indicator} {...api.getIndicatorProps()} />
      {items.map((opt) => (
        <label
          className={styles.Item}
          key={opt.value}
          {...api.getItemProps({ value: opt.value })}
        >
          <span {...api.getItemTextProps({ value: opt.value })}>
            {opt.label}
          </span>
          <input {...api.getItemHiddenInputProps({ value: opt.value })} />
        </label>
      ))}
    </div>
  )
}

const items = [
  { label: "React", value: "react" },
  { label: "Angular", value: "ng" },
  { label: "Vue", value: "vue" },
]
