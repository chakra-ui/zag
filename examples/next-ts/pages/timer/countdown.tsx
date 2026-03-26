import styles from "../../../../shared/src/css/timer.module.css"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as timer from "@zag-js/timer"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default function Page() {
  const service = useMachine(timer.machine, {
    id: useId(),
    countdown: true,
    autoStart: true,
    startMs: timer.parse({ days: 2, seconds: 10 }),
    onComplete() {
      console.log("Timer completed")
    },
  })

  const api = timer.connect(service, normalizeProps)

  return (
    <>
      <main className="timer">
        <div {...api.getRootProps()} className={styles.Root}>
          <div {...api.getAreaProps()} className={styles.Area}>
            <div {...api.getItemProps({ type: "days" })} className={styles.Item}>{api.formattedTime.days}</div>
            <div {...api.getSeparatorProps()} className={styles.Separator}>:</div>
            <div {...api.getItemProps({ type: "hours" })} className={styles.Item}>{api.formattedTime.hours}</div>
            <div {...api.getSeparatorProps()} className={styles.Separator}>:</div>
            <div {...api.getItemProps({ type: "minutes" })} className={styles.Item}>{api.formattedTime.minutes}</div>
            <div {...api.getSeparatorProps()} className={styles.Separator}>:</div>
            <div {...api.getItemProps({ type: "seconds" })} className={styles.Item}>{api.formattedTime.seconds}</div>
          </div>
        </div>

        <div {...api.getControlProps()} className={styles.Control}>
          <button {...api.getActionTriggerProps({ action: "start" })}>START</button>
          <button {...api.getActionTriggerProps({ action: "pause" })}>PAUSE</button>
          <button {...api.getActionTriggerProps({ action: "resume" })}>RESUME</button>
          <button {...api.getActionTriggerProps({ action: "reset" })}>RESET</button>
        </div>
      </main>

      <Toolbar controls={null} viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
