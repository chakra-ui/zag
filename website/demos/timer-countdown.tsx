import { normalizeProps, useMachine } from "@zag-js/react"
import * as timer from "@zag-js/timer"
import { useId } from "react"
import styles from "../styles/machines/timer.module.css"

interface TimerCountdownProps extends Omit<timer.Props, "id"> {}

export function TimerCountdown(props: TimerCountdownProps) {
  const service = useMachine(timer.machine, {
    id: useId(),
    countdown: true,
    autoStart: true,
    startMs: timer.parse({ days: 2, seconds: 10 }),
    ...props,
    interval: 1000,
  })

  const api = timer.connect(service, normalizeProps)

  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <div className={styles.Area} {...api.getAreaProps()}>
        <div className={styles.Item} {...api.getItemProps({ type: "days" })}>
          {api.formattedTime.days}
        </div>
        <div className={styles.Separator} {...api.getSeparatorProps()}>
          :
        </div>
        <div className={styles.Item} {...api.getItemProps({ type: "hours" })}>
          {api.formattedTime.hours}
        </div>
        <div className={styles.Separator} {...api.getSeparatorProps()}>
          :
        </div>
        <div className={styles.Item} {...api.getItemProps({ type: "minutes" })}>
          {api.formattedTime.minutes}
        </div>
        <div className={styles.Separator} {...api.getSeparatorProps()}>
          :
        </div>
        <div className={styles.Item} {...api.getItemProps({ type: "seconds" })}>
          {api.formattedTime.seconds}
        </div>
      </div>

      <div className={styles.Control} {...api.getControlProps()}>
        <button
          className={styles.Button}
          {...api.getActionTriggerProps({ action: "pause" })}
        >
          Pause
        </button>
        <button
          className={styles.Button}
          {...api.getActionTriggerProps({ action: "resume" })}
        >
          Resume
        </button>
      </div>
    </div>
  )
}
