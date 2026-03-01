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
    <div className={styles.Root}>
      <label className={styles.Label} {...api.getLabelProps()}>
        Select a date
      </label>
      <div className={styles.Control} {...api.getControlProps()}>
        {Array.from({ length: api.groupCount }, (_, index) => (
          <div key={index} className={styles.FieldGroup}>
            <div
              className={styles.SegmentGroup}
              {...api.getSegmentGroupProps({ index })}
            >
              {api.getSegments({ index }).map((segment, i) => (
                <span
                  key={i}
                  className={
                    segment.type === "literal"
                      ? styles.Separator
                      : styles.Segment
                  }
                  {...api.getSegmentProps({ segment, index })}
                >
                  {segment.text}
                </span>
              ))}
            </div>
            <input {...api.getHiddenInputProps({ index })} />
          </div>
        ))}
      </div>
      <button className={styles.ClearButton} onClick={api.clearValue}>
        Clear
      </button>
    </div>
  )
}
