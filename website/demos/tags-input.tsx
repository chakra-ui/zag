import { normalizeProps, useMachine } from "@zag-js/react"
import * as tagsInput from "@zag-js/tags-input"
import { useId } from "react"
import styles from "../styles/machines/tags-input.module.css"

interface TagsInputProps extends Omit<tagsInput.Props, "id"> {}

export function TagsInput(props: TagsInputProps) {
  const service = useMachine(tagsInput.machine, {
    id: useId(),
    defaultValue: ["React", "Vue"],
    ...props,
  })

  const api = tagsInput.connect(service, normalizeProps)

  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Enter frameworks:</label>
      <div className={styles.Control} {...api.getControlProps()}>
        {api.value.map((value, index) => {
          const opt = { index, value }
          return (
            <span key={index} {...api.getItemProps(opt)}>
              <div
                className={styles.ItemPreview}
                {...api.getItemPreviewProps(opt)}
              >
                <span>{value}</span>
                <button
                  className={styles.ItemDeleteTrigger}
                  {...api.getItemDeleteTriggerProps(opt)}
                >
                  &#x2715;
                </button>
              </div>
              <input
                className={styles.ItemInput}
                {...api.getItemInputProps(opt)}
              />
            </span>
          )
        })}
        <input
          className={styles.Input}
          placeholder="Add tag..."
          {...api.getInputProps()}
        />
      </div>
    </div>
  )
}
