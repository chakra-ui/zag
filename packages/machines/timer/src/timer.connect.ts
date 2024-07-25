import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./timer.anatomy"
import type { MachineApi, Send, State } from "./timer.types"

const validActions = new Set(["start", "pause", "resume", "reset", "restart"])

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

    getRootProps() {
      return normalize.element({
        role: "timer",
        ...parts.root.attrs,
      })
    },

    getItemProps(props) {
      const value = time[props.type]
      return normalize.element({
        ...parts.item.attrs,
        "data-type": props.type,
        style: {
          "--value": value,
        },
      })
    },

    getItemLabelProps(props) {
      return normalize.element({
        ...parts.itemLabel.attrs,
        "data-type": props.type,
      })
    },

    getItemValueProps(props) {
      return normalize.element({
        ...parts.itemValue.attrs,
        "data-type": props.type,
      })
    },

    getSeparatorProps() {
      return normalize.element({
        ...parts.separator.attrs,
      })
    },

    getActionTriggerProps(props) {
      if (!validActions.has(props.action)) {
        throw new Error(`Invalid action: ${props.action}. Must be one of: ${Array.from(validActions).join(", ")}`)
      }

      return normalize.button({
        ...parts.actionTrigger.attrs,
        onClick() {
          send(props.action.toUpperCase())
        },
      })
    },
  }
}
