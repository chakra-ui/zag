import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./timer.anatomy"
import type { MachineApi, Send, State } from "./timer.types"
import { dom } from "./timer.dom"

const validActions = new Set(["start", "pause", "resume", "reset"])

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
        id: dom.getRootId(state.context),
        ...parts.root.attrs,
      })
    },

    getAreaProps() {
      return normalize.element({
        role: "timer",
        id: dom.getAreaId(state.context),
        "aria-label": `${time.days} days ${formattedTime.hours}:${formattedTime.minutes}:${formattedTime.seconds}`,
        "aria-atomic": true,
        ...parts.area.attrs,
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs,
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
        "aria-hidden": true,
        ...parts.separator.attrs,
      })
    },

    getActionTriggerProps(props) {
      if (!validActions.has(props.action)) {
        throw new Error(
          `[zag-js] Invalid action: ${props.action}. Must be one of: ${Array.from(validActions).join(", ")}`,
        )
      }

      return normalize.button({
        ...parts.actionTrigger.attrs,
        hidden: (() => {
          switch (props.action) {
            case "start":
              return running || paused
            case "pause":
              return !running
            case "reset":
              return !running && !paused
            case "resume":
              return !paused
            default:
              return
          }
        })(),
        type: "button",
        onClick(event) {
          if (event.defaultPrevented) return
          send(props.action.toUpperCase())
        },
      })
    },
  }
}
