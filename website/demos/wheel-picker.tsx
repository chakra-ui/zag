import * as wheelPicker from "@zag-js/wheel-picker"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import styles from "../styles/machines/wheel-picker.module.css"

const frameworks = wheelPicker.collection({
  items: [
    { label: "React", value: "react" },
    { label: "Vue", value: "vue" },
    { disabled: true, label: "Angular (unavailable)", value: "angular" },
    { label: "Svelte", value: "svelte" },
    { label: "Solid", value: "solid" },
    { label: "Preact", value: "preact" },
    { label: "Qwik", value: "qwik" },
    { label: "Lit", value: "lit" },
  ],
})

interface WheelPickerProps extends Omit<
  wheelPicker.Props,
  "id" | "collection"
> {}

export function WheelPicker(props: WheelPickerProps) {
  const service = useMachine(wheelPicker.machine, {
    id: useId(),
    collection: frameworks,
    defaultValue: "react",
    name: "framework",
    ...props,
  })

  const api = wheelPicker.connect(service, normalizeProps)

  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <label className={styles.Label} {...api.getLabelProps()}>
        Framework
      </label>

      <div className={styles.Control} {...api.getControlProps()}>
        <div className={styles.Viewport} {...api.getViewportProps()}>
          <ul {...api.getItemGroupProps()}>
            {api.items.map(({ item, index, key }) => (
              <li
                className={styles.Item}
                key={key}
                {...api.getItemProps({ item, index })}
              >
                {item.label}
              </li>
            ))}
          </ul>

          <div className={styles.Highlight} {...api.getHighlightProps()}>
            <ul {...api.getHighlightItemGroupProps()}>
              {api.highlightItems.map(({ item, index, key }) => (
                <li
                  className={styles.HighlightItem}
                  key={key}
                  {...api.getHighlightItemProps({ item, index })}
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <select {...api.getHiddenSelectProps()}>
        {frameworks.items.map((item) => (
          <option key={item.value} value={item.value} disabled={item.disabled}>
            {item.label}
          </option>
        ))}
      </select>

      <output className={styles.Output}>Selected: {api.valueAsString}</output>
    </div>
  )
}
