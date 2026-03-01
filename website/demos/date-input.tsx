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

  const groupCount = api.displayValues.length

  return (
    <div className={styles.Root}>
      <div className={styles.Control} {...api.getControlProps()}>
        {Array.from({ length: groupCount }, (_, index) => (
          <div key={index} className={styles.FieldGroup}>
            <label className={styles.Label} {...api.getLabelProps({ index })}>
              {groupCount > 1
                ? index === 0
                  ? "Start date"
                  : "End date"
                : "Select a date"}
            </label>
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
