import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { State, Send } from "./time-picker.types"
import { parts } from "./time-picker.anatomy"
import { dom } from "./time-picker.dom"
import { getPlacementStyles } from "@zag-js/popper"
import { getNumberAsString, getStringifiedValue } from "./time-picker.utils"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isOpen = state.hasTag("open")

  const disabled = state.context.disabled

  const popperStyles = getPlacementStyles({
    ...state.context.positioning,
    placement: state.context.currentPlacement,
  })

  return {
    isOpen,
    reposition(options = {}) {
      send({ type: "POSITIONING.SET", options })
    },
    getAvailableHours() {
      const length = state.context.period === null ? 24 : 12
      return Array.from({ length }, (_, i) => (i === 0 ? 12 : i))
    },
    getAvailableMinutes() {
      return Array.from({ length: 60 }, (_, i) => i)
    },

    triggerProps: normalize.button({
      ...parts.trigger.attrs,
      id: dom.getTriggerId(state.context),
      type: "button",
      "data-placement": state.context.currentPlacement,
      disabled,
      onClick() {
        send("TRIGGER.CLICK")
      },
    }),
    clearTriggerProps: normalize.button({
      ...parts.clearTrigger.attrs,
      id: dom.getClearTriggerId(state.context),
      type: "button",
      hidden: !state.context.value,
      disabled,
      onClick() {
        send("VALUE.CLEAR")
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
      placeholder: "12:00 AM",
      disabled,
      onBlur(event) {
        const { value } = event.target
        send({ type: "INPUT.BLUR", value })
      },
    }),
    rootProps: normalize.element({
      ...parts.root.attrs,
    }),
    getHourCellProps({ hour }: { hour: number }) {
      return normalize.button({
        ...parts.hourCell.attrs,
        "data-selected": state.context.value?.hour === hour ? true : undefined,
        type: "button",
        children: getNumberAsString(hour),
        disabled,
        onClick() {
          send({ type: "HOUR.CLICK", hour })
        },
      })
    },
    getMinuteCellProps({ minute }: { minute: number }) {
      return normalize.button({
        ...parts.minuteCell.attrs,
        "data-selected": state.context.value?.minute === minute ? true : undefined,
        type: "button",
        children: getNumberAsString(minute),
        disabled,
        onClick() {
          send({ type: "MINUTE.CLICK", minute })
        },
      })
    },
    getPeriodTriggerProps({ period }: { period: "am" | "pm" }) {
      return normalize.button({
        ...parts.periodTrigger.attrs,
        "data-selected": state.context.period === period ? true : undefined,
        type: "button",
        disabled,
        onClick() {
          send({ type: "PERIOD.CLICK", period })
        },
      })
    },
  }
}
