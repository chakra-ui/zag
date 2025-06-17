import { normalizeProps, useMachine } from "@zag-js/react"
import * as timer from "@zag-js/timer"
import { useId } from "react"

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
    <div {...api.getRootProps()}>
      <div {...api.getAreaProps()}>
        <div {...api.getItemProps({ type: "days" })}>
          {api.formattedTime.days}
        </div>
        <div {...api.getSeparatorProps()}>:</div>
        <div {...api.getItemProps({ type: "hours" })}>
          {api.formattedTime.hours}
        </div>
        <div {...api.getSeparatorProps()}>:</div>
        <div {...api.getItemProps({ type: "minutes" })}>
          {api.formattedTime.minutes}
        </div>
        <div {...api.getSeparatorProps()}>:</div>
        <div {...api.getItemProps({ type: "seconds" })}>
          {api.formattedTime.seconds}
        </div>
      </div>

      <div {...api.getControlProps()}>
        <button {...api.getActionTriggerProps({ action: "pause" })}>
          Pause
        </button>
        <button {...api.getActionTriggerProps({ action: "resume" })}>
          Resume
        </button>
      </div>
    </div>
  )
}
