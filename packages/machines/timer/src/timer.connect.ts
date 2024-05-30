import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./timer.anatomy"
import type { MachineApi, Send, State } from "./timer.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const running = state.matches("running")
  const paused = state.matches("paused")

  const time = state.context.time
  const formattedTime = state.context.formattedTime
  const progressPercent = state.context.progressPercent

  return {
    running,
    paused,
    time,
    formattedTime,
    progressPercent,
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
    getRootProps: () => normalize.element({
      role: "timer",
      ...parts.root.attrs,
    }),
    getControlProps: () => normalize.element({
      ...parts.control.attrs,
    }),
    getSegmentProps(props) {
      const value = time[props.type]
      return normalize.element({
        ...parts.segment.attrs,
        "data-type": props.type,
        style: {
          "--value": value,
        },
      })
    },
    getSeparatorProps: () => normalize.element({
      ...parts.separator.attrs,
    }),
  }
}
