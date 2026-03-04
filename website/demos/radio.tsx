import * as radio from "@zag-js/radio-group"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import styles from "../styles/machines/radio.module.css"

const items = [
  { id: "apple", label: "Apples" },
  { id: "orange", label: "Oranges" },
  { id: "mango", label: "Mangoes" },
]

interface RadioProps extends Omit<radio.Props, "id"> {}

export function Radio(props: RadioProps) {
  const service = useMachine(radio.machine, {
    id: useId(),
    ...props,
    name: "fruits",
  })

  const api = radio.connect(service, normalizeProps)

  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <h2 {...api.getLabelProps()}>Fruits</h2>
      <div className={styles.ItemsGroup}>
        {items.map((opt) => (
          <label
            className={styles.Item}
            key={opt.id}
            {...api.getItemProps({ value: opt.id })}
          >
            <span
              className={styles.ItemText}
              {...api.getItemTextProps({ value: opt.id })}
            >
              {opt.label}
            </span>
            <input
              data-peer=""
              {...api.getItemHiddenInputProps({ value: opt.id })}
            />
            <div
              className={styles.ItemControl}
              {...api.getItemControlProps({ value: opt.id })}
            >
              {api.value === opt.id && (
                <svg
                  viewBox="0 0 24 24"
                  fill="currentcolor"
                  transform="scale(0.7)"
                >
                  <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
                </svg>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}
