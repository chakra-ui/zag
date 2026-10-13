import { createEffect, createSignal, Index, onCleanup, Show } from "solid-js"
import { NumberFlow } from "~/components/number-flow"
import "@styles/number-flow.css"

const START = 90 * 60

const twoDigits = { minimumIntegerDigits: 2 }

export default function Page() {
  const [seconds, setSeconds] = createSignal(START)
  const [running, setRunning] = createSignal(true)

  createEffect(() => {
    if (!running()) return
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000)
    onCleanup(() => clearInterval(id))
  })

  const units = () => [
    { label: "Hours", value: Math.floor(seconds() / 3600) },
    { label: "Minutes", value: Math.floor((seconds() % 3600) / 60) },
    { label: "Seconds", value: seconds() % 60 },
  ]

  return (
    <main class="number-flow">
      <div class="nf-countdown" role="timer">
        <Index each={units()}>
          {(unit, index) => (
            <div class="hstack gap-1 items-start">
              <Show when={index > 0}>
                <span class="nf-colon">:</span>
              </Show>
              <div class="nf-unit">
                {/* trend -1: digits always roll downward, like a clock counting down */}
                <NumberFlow value={unit().value} formatOptions={twoDigits} trend={-1} />
                <small>{unit().label}</small>
              </div>
            </div>
          )}
        </Index>
      </div>

      <div class="hstack">
        <button onClick={() => setRunning((r) => !r)}>{running() ? "Pause" : "Start"}</button>
        <button onClick={() => setSeconds(START)}>Reset</button>
      </div>
    </main>
  )
}
