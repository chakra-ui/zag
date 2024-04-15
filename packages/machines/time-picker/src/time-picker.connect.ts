import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { State, Send, TimePeriod } from "./time-picker.types"
import { parts } from "./time-picker.anatomy"
import { dom } from "./time-picker.dom"
import { getPlacementStyles } from "@zag-js/popper"
import { getNumberAsString, getPeriodHour, getStringifiedValue } from "./time-picker.utils"
import { ariaAttr, dataAttr } from "@zag-js/dom-query"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isOpen = state.hasTag("open")

  const disabled = state.context.disabled
  const placeholder = state.context.placeholder
  const min = state.context.min
  const max = state.context.max
  const steps = state.context.steps
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
      const step = steps?.hour
      if (!step) return hours
      return hours.filter((hour: number) => hour % step === 0)
    },
    getAvailableMinutes() {
      const minutes = Array.from({ length: 60 }, (_, i) => i)
      const step = steps?.minute
      if (!step) return minutes
      return minutes.filter((minute: number) => minute % step === 0)
    },
    getAvailableSeconds() {
      const seconds = Array.from({ length: 60 }, (_, i) => i)
      const step = steps?.second
      if (!step) return seconds
      return seconds.filter((second: number) => second % step === 0)
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
      const isSelectable = !(
        (min && getPeriodHour(hour, state.context.period) < min.hour) ||
        (max && getPeriodHour(hour, state.context.period) > max.hour)
      )
      return normalize.button({
        ...parts.hourCell.attrs,
        type: "button",
        children: getNumberAsString(hour),
        "aria-disabled": ariaAttr(!isSelectable),
        "data-disabled": dataAttr(!isSelectable),
        "data-selected": dataAttr(state.context.value?.hour === getPeriodHour(hour, state.context.period)),
        onClick() {
          if (!isSelectable) return
          send({ type: "HOUR.CLICK", hour })
        },
      })
    },
    getMinuteCellProps({ minute }: { minute: number }) {
      const { value } = state.context
      const minMinute = min?.set({ second: 0 })
      const maxMinute = max?.set({ second: 0 })
      const isSelectable = !(
        (minMinute && value && minMinute.compare(value.set({ minute })) > 0) ||
        (maxMinute && value && maxMinute.compare(value.set({ minute })) < 0)
      )
      return normalize.button({
        ...parts.minuteCell.attrs,
        type: "button",
        children: getNumberAsString(minute),
        "aria-disabled": ariaAttr(!isSelectable),
        "data-disabled": dataAttr(!isSelectable),
        "data-selected": dataAttr(state.context.value?.minute === minute),
        onClick() {
          if (!isSelectable) return
          send({ type: "MINUTE.CLICK", minute })
        },
      })
    },
    getSecondCellProps({ second }: { second: number }) {
      const { value } = state.context
      const isSelectable = !(
        (min && value?.minute && min.compare(value.set({ second })) > 0) ||
        (max && value?.minute && max.compare(value.set({ second })) < 0)
      )
      return normalize.button({
        ...parts.secondCell.attrs,
        type: "button",
        children: getNumberAsString(second),
        "aria-disabled": ariaAttr(!isSelectable),
        "data-disabled": dataAttr(!isSelectable),
        "data-selected": dataAttr(state.context.value?.second === second),
        onClick() {
          if (!isSelectable) return
          send({ type: "SECOND.CLICK", second })
        },
      })
    },
    getPeriodTriggerProps({ period }: { period: TimePeriod }) {
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
