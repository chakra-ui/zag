import * as timer from "@zag-js/timer"
import { useMachine, normalizeProps } from "@zag-js/react"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { FlipTimer } from "../components/flip-timer"

export default function Page() {
  const [stopwatchstate, stopwatchsend] = useMachine(
    timer.machine({
      id: useId(),
      mode: "stopwatch",
      autostart: true,
    }),
  )

  const stopwatch = timer.connect(stopwatchstate, stopwatchsend, normalizeProps)

  const [countdownstate, countdownsend] = useMachine(
    timer.machine({
      id: useId(),
      mode: "countdown",
      duration: 466_153_000,
      autostart: true,
      min: -5000,
    }),
  )

  const countdown = timer.connect(countdownstate, countdownsend, normalizeProps)

  return (
    <>
      <main className="timer">
        <div>
          <h1> Stopwatch</h1>

          <FlipTimer time={stopwatch.countTimeUnits} />

          <h2>paused: {stopwatch.paused.toString()}</h2>
          <button onClick={stopwatch.start}>START</button>
          <button onClick={stopwatch.pause}>PAUSE</button>
          <button onClick={stopwatch.resume}>RESUME</button>
          <button onClick={stopwatch.reset}>RESET</button>
          <button onClick={stopwatch.restart}>RESTART</button>
        </div>

        <div>
          <h1> Countdown</h1>

          <FlipTimer reverse time={countdown.countTimeUnits} />

          <h2>completed: {countdown.completed.toString()}</h2>
          <button onClick={countdown.start}>START</button>
          <button onClick={countdown.pause}>PAUSE</button>
          <button onClick={countdown.resume}>RESUME</button>
          <button onClick={countdown.reset}>RESET</button>
        </div>
      </main>

      <Toolbar controls={null} viz>
        <StateVisualizer state={stopwatch} label="Stopwatch" />
        <StateVisualizer state={countdown} label="Countdown" />
      </Toolbar>
    </>
  )
}
