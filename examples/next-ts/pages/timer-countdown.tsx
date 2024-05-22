import { normalizeProps, useMachine } from "@zag-js/react"
import * as timer from "@zag-js/timer"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const [state, send] = useMachine(
    timer.machine({
      id: useId(),
      countdown: true,
      autoStart: true,
      startMs: timer.parse({ day: 2, second: 10 }),
      onComplete() {
        console.log("Timer completed")
      },
    }),
  )

  const api = timer.connect(state, send, normalizeProps)

  return (
    <>
      <main className="timer">
        <div {...api.rootProps}>
          <div {...api.getSegmentProps({ type: "day" })}>{api.segments.day}</div>
          <div {...api.separatorProps}>:</div>
          <div {...api.getSegmentProps({ type: "hour" })}>{api.segments.hour}</div>
          <div {...api.separatorProps}>:</div>
          <div {...api.getSegmentProps({ type: "minute" })}>{api.segments.minute}</div>
          <div {...api.separatorProps}>:</div>
          <div {...api.getSegmentProps({ type: "second" })}>{api.segments.second}</div>
        </div>

        <div style={{ display: "flex", gap: "4px" }}>
          <button onClick={api.start}>START</button>
          <button onClick={api.pause}>PAUSE</button>
          <button onClick={api.resume}>RESUME</button>
          <button onClick={api.reset}>RESET</button>
        </div>
      </main>

      <Toolbar controls={null} viz>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
