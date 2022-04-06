import { createMachine } from "@zag-js/core"
import { useMachine } from "@zag-js/react"

type State = {
  value: "idle" | "ticking" | "paused"
}

type Context = {
  value: number
  laps: number[]
  __started: boolean
  tickInterval: number
  readonly formattedLaps: string[]
  readonly remainder: number
}

const stopwatch = createMachine<Context, State>(
  {
    initial: "idle",
    context: {
      value: 0,
      laps: [],
      tickInterval: 1000,
      __started: false,
    },
    computed: {
      formattedLaps: (ctx) => {
        const result = Array.from(ctx.laps)
          .map((lap, index) => `Lap ${index + 1}: ${lap}`)
          .reverse()

        if (ctx.__started) {
          result.unshift(`Lap ${result.length + 1}: ${ctx.remainder}`)
        }

        return result
      },
      remainder: (ctx) => {
        if (ctx.value === 0) return 0
        const sum = ctx.laps.reduce((acc, value) => acc + value, 0)
        return ctx.value - sum
      },
    },
    states: {
      idle: {
        after: {
          1000: { target: "ticking", actions: "setStarted" },
        },
        on: {
          START: { target: "ticking", actions: "setStarted" },
        },
      },
      ticking: {
        every: {
          TICK_INTERVAL: "tick",
        },
        on: {
          LAP: { actions: "lap" },
          STOP: { target: "paused" },
        },
      },
      paused: {
        on: {
          RESET: { target: "idle", actions: ["clearValue", "clearLap"] },
          START: { target: "ticking" },
        },
      },
    },
  },
  {
    delays: {
      TICK_INTERVAL: (ctx) => ctx.tickInterval,
    },
    guards: {
      isZero(ctx) {
        return ctx.value === 0
      },
    },
    actions: {
      tick(ctx) {
        ctx.value++
      },
      lap(ctx) {
        ctx.laps.push(ctx.remainder)
      },
      clearValue(ctx) {
        ctx.value = 0
      },
      clearLap(ctx) {
        ctx.laps = []
      },
      setStarted(ctx) {
        ctx.__started = true
      },
    },
  },
)

export default function Page() {
  const [state, dispatch] = useMachine(stopwatch)

  const isIdle = state.matches("idle")
  const isTicking = state.matches("ticking")
  const isPaused = state.matches("paused")

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <p style={{ fontSize: "100px", lineHeight: "0" }}>{state.context.value}</p>
      <div style={{ display: "flex", gap: "20px" }}>
        {(isIdle || isTicking) && (
          <button onClick={() => dispatch("LAP")} disabled={isIdle}>
            Lap
          </button>
        )}
        {isPaused && <button onClick={() => dispatch("RESET")}>Reset</button>}
        {isTicking ? (
          <button onClick={() => dispatch("STOP")}>Stop</button>
        ) : (
          <button onClick={() => dispatch("START")}>Start</button>
        )}
      </div>
      <pre style={{ fontSize: "24px" }}>{JSON.stringify(state.context.formattedLaps, null, 2)}</pre>
    </div>
  )
}
