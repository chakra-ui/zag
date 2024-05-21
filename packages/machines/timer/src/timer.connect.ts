import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { MachineApi, State, Send } from "./timer.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const running = state.matches("running")
  const paused = state.matches("paused")
  const completed = state.matches("completed")

  const duration = state.context.duration

  const count = state.context.count
  const countTimeUnits = state.context.countTimeUnits

  return {
    running,
    paused,
    completed,
    duration,
    count,
    countTimeUnits,
    start() {
      send("START")
    },
    pause() {
      send("PAUSE")
    },
    resume() {
      send("RESUME")
    },
    reset() {
      send("RESET")
    },
    restart() {
      send("RESTART")
    },
  }
}
