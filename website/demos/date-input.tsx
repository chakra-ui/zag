import * as dateInput from "@zag-js/date-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import styles from "../styles/machines/date-input.module.css"

interface DateInputProps extends Omit<dateInput.Props, "id"> {}

export function DateInput(props: DateInputProps) {
  const service = useMachine(dateInput.machine, {
    id: useId(),
    locale: "en-US",
    selectionMode: "single",
    ...props,
  })

  const api = dateInput.connect(service, normalizeProps)

  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <label className={styles.Label} {...api.getLabelProps()}>
        Select a date
      </label>
      <div className={styles.Control} {...api.getControlProps()}>
        {api.getSegments().map((segment, i) => (
          <span
            key={i}
            className={styles.Segment}
            {...api.getSegmentProps({ segment })}
          >
            {segment.text}
          </span>
        ))}
      </div>
      <input {...api.getHiddenInputProps()} />
      <button className={styles.ClearButton} onClick={api.clearValue}>
        Clear
      </button>
    </div>
  )
}
