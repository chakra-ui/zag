import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { State, Send } from "./time-picker.types"
import { parts } from "./time-picker.anatomy"
import { dom } from "./time-picker.dom"
import { getPlacementStyles } from "@zag-js/popper"
import { getStringifiedValue } from "./time-picker.utils"

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
      dir: state.context.dir,
      id: dom.getContentId(state.context),
      hidden: !isOpen,
      tabIndex: 0,
    }),
    contentColumnProps: normalize.element({
      ...parts.contentColumn.attrs,
    }),
    controlProps: normalize.element({
      ...parts.control.attrs,
      dir: state.context.dir,
      id: dom.getControlId(state.context),
    }),
    inputProps: normalize.input({
      ...parts.input.attrs,
      dir: state.context.dir,
      autoComplete: "off",
      autoCorrect: "off",
      spellCheck: "false",
      id: dom.getInputId(state.context),
      defaultValue: getStringifiedValue(state.context),
      onBlur(event) {
        const { value } = event.target
        send({ type: "INPUT.BLUR", value })
      },
    }),
    rootProps: normalize.element({
      ...parts.root.attrs,
    }),
    getHourCellProps(hour: number) {
      return normalize.element({
        ...parts.hourCell.attrs,
        "data-selected": state.context.value.hour === hour ? true : undefined,
        onClick() {
          send({ type: "HOUR.CLICK", hour })
        },
      })
    },
    getMinuteCellProps(minute: number) {
      return normalize.element({
        ...parts.minuteCell.attrs,
        "data-selected": state.context.value.minute === minute ? true : undefined,
        onClick() {
          send({ type: "MINUTE.CLICK", minute })
        },
      })
    },
    AMPeriodTriggerProps: normalize.element({
      ...parts.amPeriodTrigger.attrs,
      "data-selected": state.context.period === "am" ? true : undefined,
      onClick() {
        send({ type: "PERIOD.CLICK", period: "am" })
      },
    }),
    PMPeriodTriggerProps: normalize.element({
      ...parts.pmPeriodTrigger.attrs,
      "data-selected": state.context.period === "pm" ? true : undefined,
      onClick() {
        send({ type: "PERIOD.CLICK", period: "pm" })
      },
    }),
  }
}
