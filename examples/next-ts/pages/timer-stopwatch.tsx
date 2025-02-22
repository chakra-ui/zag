import { normalizeProps, useMachine } from "@zag-js/react"
import * as timer from "@zag-js/timer"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const service = useMachine(timer.machine, {
    id: useId(),
    autoStart: true,
  })

  const api = timer.connect(service, normalizeProps)

  return (
    <>
      <main className="timer">
        <div {...api.getRootProps()}>
          <div {...api.getAreaProps()}>
            <div {...api.getItemProps({ type: "days" })}>{api.formattedTime.days}</div>
            <div {...api.getSeparatorProps()}>:</div>
            <div {...api.getItemProps({ type: "hours" })}>{api.formattedTime.hours}</div>
            <div {...api.getSeparatorProps()}>:</div>
            <div {...api.getItemProps({ type: "minutes" })}>{api.formattedTime.minutes}</div>
            <div {...api.getSeparatorProps()}>:</div>
            <div {...api.getItemProps({ type: "seconds" })}>{api.formattedTime.seconds}</div>
          </div>

          <div {...api.getControlProps()}>
            <button {...api.getActionTriggerProps({ action: "start" })}>START</button>
            <button {...api.getActionTriggerProps({ action: "pause" })}>PAUSE</button>
            <button {...api.getActionTriggerProps({ action: "resume" })}>RESUME</button>
            <button {...api.getActionTriggerProps({ action: "reset" })}>RESET</button>
          </div>
        </div>
      </main>

      <Toolbar controls={null} viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
