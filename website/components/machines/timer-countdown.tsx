import { normalizeProps, useMachine } from "@zag-js/react"
import * as timer from "@zag-js/timer"
import { useId } from "react"

export function TimerCountdown() {
  const [state, send] = useMachine(
    timer.machine({
      id: useId(),
      countdown: true,
      autoStart: true,
      startMs: timer.parse({ days: 2, seconds: 10 }),
    }),
  )

  const api = timer.connect(state, send, normalizeProps)

  return (
    <div>
      <div {...api.rootProps}>
        <div {...api.getSegmentProps({ type: "days" })}>
          {api.formattedTime.days}
        </div>
        <div {...api.separatorProps}>:</div>
        <div {...api.getSegmentProps({ type: "hours" })}>
          {api.formattedTime.hours}
        </div>
        <div {...api.separatorProps}>:</div>
        <div {...api.getSegmentProps({ type: "minutes" })}>
          {api.formattedTime.minutes}
        </div>
        <div {...api.separatorProps}>:</div>
        <div {...api.getSegmentProps({ type: "seconds" })}>
          {api.formattedTime.seconds}
        </div>
      </div>

      <div {...api.controlProps}>
        {api.running && <button onClick={api.pause}>Pause</button>}
        {api.paused && <button onClick={api.resume}>Resume</button>}
      </div>
    </div>
  )
}
