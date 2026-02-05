import * as progress from "@zag-js/progress"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import styles from "../styles/machines/progress.module.css"

interface ProgressLinearProps extends Omit<progress.Props, "id"> {}

export function ProgressLinear(props: ProgressLinearProps) {
  const service = useMachine(progress.machine, {
    id: useId(),
    ...props,
  })

  const api = progress.connect(service, normalizeProps)

  return (
    <div>
      <div className={styles.Root} {...api.getRootProps()}>
        <div {...api.getLabelProps()}>Upload progress</div>
        <div className={styles.Track} {...api.getTrackProps()}>
          <div className={styles.Range} {...api.getRangeProps()} />
        </div>
        <div {...api.getValueTextProps()}>{api.valueAsString}</div>
      </div>

      <div className={styles.ButtonGroup}>
        <button
          className={styles.Button}
          onClick={() => api.setValue((api.value ?? 0) - 20)}
        >
          Decrease
        </button>

        <button
          className={styles.Button}
          onClick={() => api.setValue((api.value ?? 0) + 20)}
        >
          Increase
        </button>

        <button className={styles.Button} onClick={() => api.setValue(null)}>
          Indeterminate
        </button>
      </div>
    </div>
  )
}
