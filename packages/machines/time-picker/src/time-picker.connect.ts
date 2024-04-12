import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { State, Send } from "./time-picker.types"
import { parts } from "./time-picker.anatomy"
import { dom } from "./time-picker.dom"
import { getPlacementStyles } from "@zag-js/popper"
import { createConditions, getNumberAsString, getStringifiedValue } from "./time-picker.utils"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isOpen = state.hasTag("open")

  const disabled = state.context.disabled
  const placeholder = state.context.placeholder
  const hourOptions = state.context.hourOptions
  const minuteOptions = state.context.minuteOptions
  const secondOptions = state.context.secondOptions
  const withSeconds = state.context.withSeconds

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
      const hours = Array.from({ length }, (_, i) => i + 1)
      if (!hourOptions) return hours
      const { steps, max, min } = hourOptions
      const conditions = createConditions(
        steps && ((hour: number) => hour % steps === 0),
        max && ((hour: number) => hour <= max),
        min && ((hour: number) => hour >= min),
      )
      return hours.filter(conditions)
    },
    getAvailableMinutes() {
      const minutes = Array.from({ length: 60 }, (_, i) => i)
      if (!minuteOptions) return minutes
      const { steps, max, min } = minuteOptions
      const conditions = createConditions(
        steps && ((minute: number) => minute % steps === 0),
        max && ((minute: number) => minute <= max),
        min && ((minute: number) => minute >= min),
      )
      return minutes.filter(conditions)
    },
    getAvailableSeconds() {
      const seconds = Array.from({ length: 60 }, (_, i) => i)
      if (!secondOptions) return seconds
      const { steps, max, min } = secondOptions
      const conditions = createConditions(
        steps && ((second: number) => second % steps === 0),
        max && ((second: number) => second <= max),
        min && ((second: number) => second >= min),
      )
      return seconds.filter(conditions)
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
    getContentColumnProps({ type }: { type: "hour" | "minute" | "second" | "period" }) {
      return normalize.element({
        ...parts.contentColumn.attrs,
        hidden: !state.context.withSeconds && type === "second",
      })
    },
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
      placeholder: placeholder ?? `12:00${withSeconds ? ":00" : ""} AM`,
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
    getSecondCellProps({ second }: { second: number }) {
      return normalize.button({
        ...parts.secondCell.attrs,
        "data-selected": state.context.value?.second === second ? true : undefined,
        type: "button",
        children: getNumberAsString(second),
        disabled,
        onClick() {
          send({ type: "SECOND.CLICK", second })
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
