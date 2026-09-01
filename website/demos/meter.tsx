import * as meter from "@zag-js/meter"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import styles from "../styles/machines/meter.module.css"

interface MeterProps extends Omit<meter.Props, "id"> {}

export function Meter(props: MeterProps) {
  const service = useMachine(meter.machine, {
    id: useId(),
    defaultValue: 70,
    low: 60,
    high: 85,
    optimum: 10,
    ...props,
  })

  const api = meter.connect(service, normalizeProps)

  return (
    <div>
      <div className={styles.Root} {...api.getRootProps()}>
        <div className={styles.Header}>
          <div {...api.getLabelProps()}>Storage used</div>
          <div {...api.getValueTextProps()}>
            {api.valueAsString} · {api.valueState}
          </div>
        </div>
        <div className={styles.Track} {...api.getTrackProps()}>
          <div className={styles.Indicator} {...api.getIndicatorProps()} />
        </div>
      </div>

      <div className={styles.ButtonGroup}>
        {[10, 70, 95].map((value) => (
          <button
            key={value}
            className={styles.Button}
            onClick={() => api.setValue(value)}
          >
            Set {value}%
          </button>
        ))}
      </div>
    </div>
  )
}
