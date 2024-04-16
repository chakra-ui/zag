import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { State, Send, MachineApi } from "./time-picker.types"
import { parts } from "./time-picker.anatomy"
import { dom } from "./time-picker.dom"
import { getPlacementStyles } from "@zag-js/popper"
import { getNumberAsString, getPeriodHour, getStringifiedValue } from "./time-picker.utils"
import { ariaAttr, dataAttr } from "@zag-js/dom-query"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const value = state.context.value

  const disabled = state.context.disabled
  const readOnly = state.context.readOnly

  const min = state.context.min
  const max = state.context.max
  const steps = state.context.steps
  const withSeconds = state.context.withSeconds
  const placeholder = state.context.placeholder

  const isFocused = state.matches("focused")
  const isOpen = state.hasTag("open")

  const currentPlacement = state.context.currentPlacement
  const popperStyles = getPlacementStyles({
    ...state.context.positioning,
    placement: state.context.currentPlacement,
  })

  return {
    isFocused,
    isOpen,
    value,
    valueAsString: value?.toString(),
    reposition(options = {}) {
      send({ type: "POSITIONING.SET", options })
    },
    open() {
      send("OPEN")
    },
    close() {
      send("CLOSE")
    },
    clearValue() {
      send("VALUE.CLEAR")
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

    rootProps: normalize.element({
      ...parts.root.attrs,
      "data-state": isOpen ? "open" : "closed",
      "data-disabled": dataAttr(disabled),
      "data-readonly": dataAttr(readOnly),
    }),

    labelProps: normalize.label({
      ...parts.label.attrs,
      dir: state.context.dir,
      htmlFor: dom.getInputId(state.context),
      "data-state": isOpen ? "open" : "closed",
      "data-disabled": dataAttr(disabled),
      "data-readonly": dataAttr(readOnly),
    }),

    controlProps: normalize.element({
      ...parts.control.attrs,
      dir: state.context.dir,
      id: dom.getControlId(state.context),
      "data-disabled": dataAttr(disabled),
    }),

    inputProps: normalize.input({
      ...parts.input.attrs,
      dir: state.context.dir,
      autoComplete: "off",
      autoCorrect: "off",
      spellCheck: "false",
      id: dom.getInputId(state.context),
      name: state.context.name,
      defaultValue: getStringifiedValue(state.context),
      placeholder: placeholder ?? `12:00${withSeconds ? ":00" : ""} AM`,
      disabled,
      readOnly,
      onBlur(event) {
        const { value } = event.target
        send({ type: "INPUT.BLUR", value })
      },
      onKeyDown(event) {
        if (event.key !== "Enter") return
        send({ type: "INPUT.ENTER", value: event.currentTarget.value })
        event.preventDefault()
      },
    }),

    triggerProps: normalize.button({
      ...parts.trigger.attrs,
      id: dom.getTriggerId(state.context),
      type: "button",
      "data-placement": state.context.currentPlacement,
      disabled,
      "data-readonly": dataAttr(readOnly),
      "aria-label": isOpen ? "Close calendar" : "Open calendar",
      "aria-controls": dom.getContentId(state.context),
      "data-state": isOpen ? "open" : "closed",
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
      "data-readonly": dataAttr(readOnly),
      "aria-label": "Clear time",
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
      role: "application",
      "data-state": isOpen ? "open" : "closed",
      "data-placement": currentPlacement,
      "aria-roledescription": "timepicker",
      "aria-label": "timepicker",
    }),

    getContentColumnProps({ type }) {
      return normalize.element({
        ...parts.contentColumn.attrs,
        hidden: !state.context.withSeconds && type === "second",
        tabIndex: -1,
        onKeyDown(event) {
          const { key, target } = event
          switch (key) {
            case "ArrowUp":
              send({ type: "CONTENT.COLUMN.ARROW_UP", target })
              break
            case "ArrowDown":
              send({ type: "CONTENT.COLUMN.ARROW_DOWN", target })
              break
            case "ArrowLeft":
              send({ type: "CONTENT.COLUMN.ARROW_LEFT", target })
              break
            case "ArrowRight":
              send({ type: "CONTENT.COLUMN.ARROW_RIGHT", target })
              break
            case "Enter":
              send({ type: "CONTENT.COLUMN.ENTER", target })
              break
            default:
              break
          }

          event.preventDefault()
        },
      })
    },

    getHourCellProps({ hour }) {
      const isSelectable = !(
        (min && getPeriodHour(hour, state.context.period) < min.hour) ||
        (max && getPeriodHour(hour, state.context.period) > max.hour)
      )
      const isSelected = state.context.value?.hour === getPeriodHour(hour, state.context.period)
      return normalize.button({
        ...parts.hourCell.attrs,
        type: "button",
        children: getNumberAsString(hour),
        "aria-disabled": ariaAttr(!isSelectable),
        "data-disabled": dataAttr(!isSelectable),
        "aria-selected": ariaAttr(isSelected),
        "data-selected": dataAttr(isSelected),
        "aria-label": `${hour} hours`,
        "data-value": hour,
        "data-unit": "hour",
        onClick() {
          if (!isSelectable) return
          send({ type: "HOUR.CLICK", hour })
        },
      })
    },

    getMinuteCellProps({ minute }) {
      const { value } = state.context
      const minMinute = min?.set({ second: 0 })
      const maxMinute = max?.set({ second: 0 })
      const isSelectable = !(
        (minMinute && value && minMinute.compare(value.set({ minute })) > 0) ||
        (maxMinute && value && maxMinute.compare(value.set({ minute })) < 0)
      )
      const isSelected = state.context.value?.minute === minute
      return normalize.button({
        ...parts.minuteCell.attrs,
        type: "button",
        children: getNumberAsString(minute),
        "aria-disabled": ariaAttr(!isSelectable),
        "data-disabled": dataAttr(!isSelectable),
        "aria-selected": ariaAttr(isSelected),
        "data-selected": dataAttr(isSelected),
        "aria-label": `${minute} minutes`,
        "data-value": minute,
        "data-unit": "minute",
        onClick() {
          if (!isSelectable) return
          send({ type: "MINUTE.CLICK", minute })
        },
      })
    },

    getSecondCellProps({ second }) {
      const { value } = state.context
      const isSelectable = !(
        (min && value?.minute && min.compare(value.set({ second })) > 0) ||
        (max && value?.minute && max.compare(value.set({ second })) < 0)
      )
      const isSelected = state.context.value?.second === second
      return normalize.button({
        ...parts.secondCell.attrs,
        type: "button",
        children: getNumberAsString(second),
        "aria-disabled": ariaAttr(!isSelectable),
        "data-disabled": dataAttr(!isSelectable),
        "aria-selected": ariaAttr(isSelected),
        "data-selected": dataAttr(isSelected),
        "aria-label": `${second} seconds`,
        "data-value": second,
        "data-unit": "second",
        onClick() {
          if (!isSelectable) return
          send({ type: "SECOND.CLICK", second })
        },
      })
    },

    getPeriodCellProps({ period }) {
      const isSelected = state.context.period === period
      return normalize.button({
        ...parts.periodCell.attrs,
        type: "button",
        "aria-selected": ariaAttr(isSelected),
        "data-selected": dataAttr(isSelected),
        "aria-label": period ?? undefined,
        "data-value": period ?? undefined,
        "data-unit": "period",
        onClick() {
          send({ type: "PERIOD.CLICK", period })
        },
      })
    },
  }
}
