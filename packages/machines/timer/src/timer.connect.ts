import type { Service } from "@zag-js/core"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { match } from "@zag-js/utils"
import { parts } from "./timer.anatomy"
import * as dom from "./timer.dom"
import type { ActionTriggerProps, ActionTriggerState, TimerApi, TimerSchema } from "./timer.types"

const validActions = new Set(["start", "pause", "resume", "reset", "restart"])

export function connect<T extends PropTypes>(service: Service<TimerSchema>, normalize: NormalizeProps<T>): TimerApi<T> {
  const { state, send, computed, scope, prop } = service
  const translations = prop("translations")

  const running = state.matches("running")
  const paused = state.matches("paused")

  const time = computed("time")
  const formattedTime = computed("formattedTime")
  const progressPercent = computed("progressPercent")

  // -----------------------------------------------------------------------------
  // State getters: pure, serializable per-part state, independent of `normalize`
  // -----------------------------------------------------------------------------

  function getActionTriggerState(props: ActionTriggerProps): ActionTriggerState {
    const { action } = props
    if (!validActions.has(action)) {
      throw new Error(`[zag-js] Invalid action: ${action}. Must be one of: ${Array.from(validActions).join(", ")}`)
    }
    const hidden = match(action, {
      start: () => running || paused,
      pause: () => !running,
      reset: () => !running && !paused,
      resume: () => !paused,
      restart: () => false,
    })
    return { action, visible: !hidden }
  }

  // -----------------------------------------------------------------------------
  // Prop getters
  // -----------------------------------------------------------------------------

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
        ...parts.root.attrs(scope.id),
      })
    },

    getAreaProps() {
      return normalize.element({
        role: "timer",
        id: dom.getAreaId(scope),
        "aria-label": translations.areaLabel?.(time, formattedTime),
        "aria-atomic": true,
        ...parts.area.attrs(scope.id),
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs(scope.id),
      })
    },

    getItemProps(props) {
      const value = time[props.type]
      return normalize.element({
        ...parts.item.attrs(scope.id),
        "data-type": props.type,
        style: {
          "--value": value,
        },
      })
    },

    getItemLabelProps(props) {
      return normalize.element({
        ...parts.itemLabel.attrs(scope.id),
        "data-type": props.type,
      })
    },

    getItemValueProps(props) {
      return normalize.element({
        ...parts.itemValue.attrs(scope.id),
        "data-type": props.type,
      })
    },

    getSeparatorProps() {
      return normalize.element({
        "aria-hidden": true,
        ...parts.separator.attrs(scope.id),
      })
    },

    getActionTriggerState,
    getActionTriggerProps(props) {
      const actionTriggerState = getActionTriggerState(props)

      return normalize.button({
        ...parts.actionTrigger.attrs(scope.id),
        hidden: !actionTriggerState.visible,
        type: "button",
        onClick(event) {
          if (event.defaultPrevented) return
          send({ type: props.action.toUpperCase() })
        },
      })
    },
  }
}
