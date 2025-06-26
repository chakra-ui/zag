import type { Service } from "@zag-js/core"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { match } from "@zag-js/utils"
import { parts } from "./timer.anatomy"
import * as dom from "./timer.dom"
import type { TimerApi, TimerSchema } from "./timer.types"

const validActions = new Set(["start", "pause", "resume", "reset", "restart"])

export function connect<T extends PropTypes>(service: Service<TimerSchema>, normalize: NormalizeProps<T>): TimerApi<T> {
  const { state, send, computed, scope } = service

  const running = state.matches("running")
  const paused = state.matches("paused")

  const time = computed("time")
  const formattedTime = computed("formattedTime")
  const progressPercent = computed("progressPercent")

  return {
    running,
    paused,
    time,
    formattedTime,
    progressPercent,
    start() {
      send({ type: "START" })
    },
    pause() {
      send({ type: "PAUSE" })
    },
    resume() {
      send({ type: "RESUME" })
    },
    reset() {
      send({ type: "RESET" })
    },
    restart() {
      send({ type: "RESTART" })
    },

    getRootProps() {
      return normalize.element({
        id: dom.getRootId(scope),
        ...parts.root.attrs,
      })
    },

    getAreaProps() {
      return normalize.element({
        role: "timer",
        id: dom.getAreaId(scope),
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
        hidden: match(props.action, {
          start: () => running || paused,
          pause: () => !running,
          reset: () => !running && !paused,
          resume: () => !paused,
          restart: () => false,
        }),
        type: "button",
        onClick(event) {
          if (event.defaultPrevented) return
          send({ type: props.action.toUpperCase() })
        },
      })
    },
  }
}
