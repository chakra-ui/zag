import * as progress from "@zag-js/progress"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import styles from "../styles/machines/progress.module.css"

interface ProgressCircularProps extends Omit<progress.Props, "id"> {}

export function ProgressCircular(props: ProgressCircularProps) {
  const service = useMachine(progress.machine, {
    id: useId(),
    ...props,
  })

  const api = progress.connect(service, normalizeProps)

  return (
    <div>
      <div
        className={`${styles.Root} ${styles.Centre}`}
        {...api.getRootProps()}
      >
        <div {...api.getLabelProps()}>Upload progress</div>
        <svg className={styles.Circle} {...(api.getCircleProps() as any)}>
          <circle
            className={styles.CircleTrack}
            {...(api.getCircleTrackProps() as any)}
          />
          <circle
            className={styles.CircleRange}
            {...(api.getCircleRangeProps() as any)}
          />
        </svg>
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
