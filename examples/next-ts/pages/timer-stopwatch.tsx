import * as timer from "@zag-js/timer"
import { useMachine, normalizeProps } from "@zag-js/react"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const [state, send] = useMachine(
    timer.machine({
      id: useId(),
      mode: "stopwatch",
      autostart: true,
    }),
  )

  const api = timer.connect(state, send, normalizeProps)

  return (
    <>
      <main className="timer">
        {Object.entries(api.countTimeUnits).map(([key, value]) => (
          <div key={key}>
            <b>{key}</b>: {value}
          </div>
        ))}

        <h2>paused: {api.paused.toString()}</h2>
        <button onClick={api.start}>START</button>
        <button onClick={api.pause}>PAUSE</button>
        <button onClick={api.resume}>RESUME</button>
        <button onClick={api.reset}>RESET</button>
        <button onClick={api.restart}>RESTART</button>
      </main>

      <Toolbar controls={null} viz>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
