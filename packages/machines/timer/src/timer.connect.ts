import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { MachineApi, State, Send } from "./timer.types"
import { parts } from "./timer.anatomy"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const running = state.matches("running")
  const paused = state.matches("paused")

  return {
    running,
    paused,
    segments: state.context.segments,
    progressPercent: state.context.progressPercent,
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
    rootProps: normalize.element({
      ...parts.root.attrs,
    }),
    getSegmentProps(props) {
      return normalize.element({
        ...parts.segment.attrs,
        "data-type": props.type,
      })
    },
    separatorProps: normalize.element({
      role: "separator",
      ...parts.separator.attrs,
    }),
  }
}
