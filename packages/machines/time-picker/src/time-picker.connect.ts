import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { State, Send } from "./time-picker.types"
import { parts } from "./time-picker.anatomy"
import { dom } from "./time-picker.dom"
import { getPlacementStyles } from "@zag-js/popper"
import { getFormatedValue } from "./time-picker.utils"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isOpen = state.hasTag("open")

  const popperStyles = getPlacementStyles({
    ...state.context.positioning,
    placement: state.context.currentPlacement,
  })

  return {
    isOpen,
    reposition(options = {}) {
      send({ type: "POSITIONING.SET", options })
    },
    getTimeSegment({ segment }: { segment: "hour" | "minute" }) {
      return state.context.value[segment]
    },
    getAvailableHours() {
      const length = state.context.period === null ? 24 : 12
      return Array.from({ length }, (_, i) => i)
    },
    getAvailableMinutes() {
      return Array.from({ length: 60 }, (_, i) => i)
    },

    triggerProps: normalize.element({
      ...parts.trigger.attrs,
      id: dom.getTriggerId(state.context),
      "data-placement": state.context.currentPlacement,
      onClick() {
        send("TRIGGER.CLICK")
      },
    }),
    positionerProps: normalize.element({
      ...parts.positioner.attrs,
      dir: state.context.dir,
      id: dom.getPositionerId(state.context),
      style: popperStyles.floating,
    }),
    contentProps: normalize.element({
      ...parts.content.attrs,
      hidden: !isOpen,
    }),
    controlProps: normalize.element({
      ...parts.control.attrs,
    }),
    inputProps: normalize.element({
      ...parts.input.attrs,
      dir: state.context.dir,
      id: dom.getInputId(state.context),
      value: getFormatedValue(state.context),
      onChange() {},
    }),
    rootProps: normalize.element({
      ...parts.root.attrs,
    }),
    getHourCellProps(hour: number) {
      return normalize.element({
        ...parts.hourCell.attrs,
        "data-active": state.context.value.hour === hour,
        onClick() {
          send({ type: "HOUR.CLICK", hour })
        },
      })
    },
    getMinuteCellProps(minute: number) {
      return normalize.element({
        ...parts.minuteCell.attrs,
        "data-active": state.context.value.minute === minute,
        onClick() {
          send({ type: "MINUTE.CLICK", minute })
        },
      })
    },
    AMPeriodTriggerProps: normalize.element({
      ...parts.AMPeriodTrigger.attrs,
      "data-active": state.context.period === "am",
      onClick() {
        send({ type: "PERIOD.CLICK", period: "am" })
      },
    }),
    PMPeriodTriggerProps: normalize.element({
      ...parts.PMPeriodTrigger.attrs,
      "data-active": state.context.period === "pm",
      onClick() {
        send({ type: "PERIOD.CLICK", period: "pm" })
      },
    }),
  }
}
