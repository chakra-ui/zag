import { getEventKey, type EventKeyMap } from "@zag-js/dom-event"
import { ariaAttr, dataAttr, isComposingEvent } from "@zag-js/dom-query"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./time-picker.anatomy"
import { dom } from "./time-picker.dom"
import type { MachineApi, Send, State } from "./time-picker.types"
import {
  get12HourFormatPeriodHour,
  getHourPeriod,
  getInputPlaceholder,
  is12HourFormat,
  padStart,
} from "./time-picker.utils"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const disabled = state.context.disabled
  const readOnly = state.context.readOnly

  const locale = state.context.locale
  const hour12 = is12HourFormat(locale)

  const min = state.context.min
  const max = state.context.max
  const steps = state.context.steps

  const focused = state.matches("focused")
  const open = state.hasTag("open")

  const value = state.context.value
  const valueAsString = state.context.valueAsString
  const currentTime = state.context.currentTime

  const currentPlacement = state.context.currentPlacement
  const popperStyles = getPlacementStyles({
    ...state.context.positioning,
    placement: state.context.currentPlacement,
  })

  return {
    focused,
    open,
    value,
    valueAsString,
    hour12,
    reposition(options = {}) {
      send({ type: "POSITIONING.SET", options })
    },
    setOpen(nextOpen) {
      if (nextOpen === open) return
      send(nextOpen ? "OPEN" : "CLOSE")
    },
    setUnitValue(unit, value) {
      send({ type: "UNIT.SET", unit, value })
    },
    setValue(value) {
      send({ type: "VALUE.SET", value })
    },
    clearValue() {
      send("VALUE.CLEAR")
    },
    getHours() {
      const length = hour12 ? 12 : 24
      const arr = Array.from({ length }, (_, i) => i)
      const step = steps?.hour
      const hours = step != null ? arr.filter((hour) => hour % step === 0) : arr
      return hours.map((value) => ({ label: hour12 && value === 0 ? "12" : padStart(value), value }))
    },
    getMinutes() {
      const arr = Array.from({ length: 60 }, (_, i) => i)
      const step = steps?.minute
      const minutes = step != null ? arr.filter((minute) => minute % step === 0) : arr
      return minutes.map((value) => ({ label: padStart(value), value }))
    },
    getSeconds() {
      const arr = Array.from({ length: 60 }, (_, i) => i)
      const step = steps?.second
      const seconds = step != null ? arr.filter((second) => second % step === 0) : arr
      return seconds.map((value) => ({ label: padStart(value), value }))
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        "data-state": open ? "open" : "closed",
        "data-disabled": dataAttr(disabled),
        "data-readonly": dataAttr(readOnly),
      })
    },

    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs,
        dir: state.context.dir,
        htmlFor: dom.getInputId(state.context),
        "data-state": open ? "open" : "closed",
        "data-disabled": dataAttr(disabled),
        "data-readonly": dataAttr(readOnly),
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs,
        dir: state.context.dir,
        id: dom.getControlId(state.context),
        "data-disabled": dataAttr(disabled),
      })
    },

    getInputProps() {
      return normalize.input({
        ...parts.input.attrs,
        dir: state.context.dir,
        autoComplete: "off",
        autoCorrect: "off",
        spellCheck: "false",
        id: dom.getInputId(state.context),
        name: state.context.name,
        defaultValue: valueAsString,
        placeholder: getInputPlaceholder(state.context),
        disabled,
        readOnly,
        onFocus() {
          send("INPUT.FOCUS")
        },
        onBlur(event) {
          const { value } = event.target
          send({ type: "INPUT.BLUR", value })
        },
        onKeyDown(event) {
          if (isComposingEvent(event)) return
          if (event.key !== "Enter") return
          send({ type: "INPUT.ENTER", value: event.currentTarget.value })
          event.preventDefault()
        },
      })
    },

    getTriggerProps() {
      return normalize.button({
        ...parts.trigger.attrs,
        id: dom.getTriggerId(state.context),
        type: "button",
        "data-placement": state.context.currentPlacement,
        disabled,
        "data-readonly": dataAttr(readOnly),
        "aria-label": open ? "Close calendar" : "Open calendar",
        "aria-controls": dom.getContentId(state.context),
        "data-state": open ? "open" : "closed",
        onClick(event) {
          if (event.defaultPrevented) return
          send("TRIGGER.CLICK")
        },
      })
    },

    getClearTriggerProps() {
      return normalize.button({
        ...parts.clearTrigger.attrs,
        id: dom.getClearTriggerId(state.context),
        type: "button",
        hidden: !state.context.value,
        disabled,
        "data-readonly": dataAttr(readOnly),
        "aria-label": "Clear time",
        onClick(event) {
          if (event.defaultPrevented) return
          send("VALUE.CLEAR")
        },
      })
    },

    getPositionerProps() {
      return normalize.element({
        ...parts.positioner.attrs,
        dir: state.context.dir,
        id: dom.getPositionerId(state.context),
        style: popperStyles.floating,
      })
    },

    getSpacerProps() {
      return normalize.element({
        ...parts.spacer.attrs,
      })
    },

    getContentProps() {
      return normalize.element({
        ...parts.content.attrs,
        dir: state.context.dir,
        id: dom.getContentId(state.context),
        hidden: !open,
        tabIndex: 0,
        role: "application",
        "data-state": open ? "open" : "closed",
        "data-placement": currentPlacement,
        "aria-roledescription": "timepicker",
        "aria-label": "timepicker",
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (isComposingEvent(event)) return

          const keyMap: EventKeyMap = {
            ArrowUp() {
              send({ type: "CONTENT.ARROW_UP" })
            },
            ArrowDown() {
              send({ type: "CONTENT.ARROW_DOWN" })
            },
            ArrowLeft() {
              send({ type: "CONTENT.ARROW_LEFT" })
            },
            ArrowRight() {
              send({ type: "CONTENT.ARROW_RIGHT" })
            },
            Enter() {
              send({ type: "CONTENT.ENTER" })
            },
            // prevent tabbing out of the time picker
            Tab() {},
            Escape() {
              if (!state.context.disableLayer) return
              send({ type: "CONTENT.ESCAPE" })
            },
          }

          const exec = keyMap[getEventKey(event, state.context)]

          if (exec) {
            exec(event)
            event.preventDefault()
          }
        },
      })
    },

    getColumnProps(props) {
      const hidden = (props.unit === "second" && !state.context.allowSeconds) || (props.unit === "period" && !hour12)
      return normalize.element({
        ...parts.column.attrs,
        id: dom.getColumnId(state.context, props.unit),
        "data-unit": props.unit,
        "data-focus": dataAttr(state.context.focusedColumn === props.unit),
        hidden,
      })
    },

    getHourCellProps(props) {
      const hour = props.value
      const isSelectable = !(
        (min && get12HourFormatPeriodHour(hour, state.context.period) < min.hour) ||
        (max && get12HourFormatPeriodHour(hour, state.context.period) > max.hour)
      )
      const isSelected = state.context.value?.hour === get12HourFormatPeriodHour(hour, state.context.period)
      const isFocused = state.context.focusedColumn === "hour" && state.context.focusedValue === hour

      const currentHour = hour12 && currentTime ? currentTime?.hour % 12 : currentTime?.hour
      const isCurrent = currentHour === hour || (hour === 12 && currentHour === 0)

      return normalize.button({
        ...parts.cell.attrs,
        type: "button",
        "aria-disabled": ariaAttr(!isSelectable),
        "data-disabled": dataAttr(!isSelectable),
        "aria-current": ariaAttr(isSelected),
        "data-selected": dataAttr(isSelected),
        "data-now": dataAttr(isCurrent),
        "data-focus": dataAttr(isFocused),
        "aria-label": `${hour} hours`,
        "data-value": hour,
        "data-unit": "hour",
        onClick(event) {
          if (event.defaultPrevented) return
          if (!isSelectable) return
          send({ type: "UNIT.CLICK", unit: "hour", value: hour })
        },
      })
    },

    getMinuteCellProps(props) {
      const minute = props.value
      const { value } = state.context
      const minMinute = min?.set({ second: 0 })
      const maxMinute = max?.set({ second: 0 })

      const isSelectable = !(
        (minMinute && value && minMinute.compare(value.set({ minute })) > 0) ||
        (maxMinute && value && maxMinute.compare(value.set({ minute })) < 0)
      )
      const isSelected = state.context.value?.minute === minute
      const isCurrent = currentTime?.minute === minute
      const isFocused = state.context.focusedColumn === "minute" && state.context.focusedValue === minute

      return normalize.button({
        ...parts.cell.attrs,
        type: "button",
        "aria-disabled": ariaAttr(!isSelectable),
        "data-disabled": dataAttr(!isSelectable),
        "aria-current": ariaAttr(isSelected),
        "data-selected": dataAttr(isSelected),
        "aria-label": `${minute} minutes`,
        "data-value": minute,
        "data-now": dataAttr(isCurrent),
        "data-focus": dataAttr(isFocused),
        "data-unit": "minute",
        onClick(event) {
          if (event.defaultPrevented) return
          if (!isSelectable) return
          send({ type: "UNIT.CLICK", unit: "minute", value: minute })
        },
      })
    },

    getSecondCellProps(props) {
      const second = props.value

      const isSelectable = !(
        (min && value?.minute && min.compare(value.set({ second })) > 0) ||
        (max && value?.minute && max.compare(value.set({ second })) < 0)
      )
      const isSelected = state.context.value?.second === second
      const isCurrent = currentTime?.second === second
      const isFocused = state.context.focusedColumn === "second" && state.context.focusedValue === second

      return normalize.button({
        ...parts.cell.attrs,
        type: "button",
        "aria-disabled": ariaAttr(!isSelectable),
        "data-disabled": dataAttr(!isSelectable),
        "aria-current": ariaAttr(isSelected),
        "data-selected": dataAttr(isSelected),
        "aria-label": `${second} seconds`,
        "data-value": second,
        "data-unit": "second",
        "data-focus": dataAttr(isFocused),
        "data-now": dataAttr(isCurrent),
        onClick(event) {
          if (event.defaultPrevented) return
          if (!isSelectable) return
          send({ type: "UNIT.CLICK", unit: "second", value: second })
        },
      })
    },

    getPeriodCellProps(props) {
      const isSelected = state.context.period === props.value
      const currentPeriod = getHourPeriod(currentTime?.hour)
      const isCurrent = currentPeriod === props.value
      const isFocused = state.context.focusedColumn === "period" && state.context.focusedValue === props.value

      return normalize.button({
        ...parts.cell.attrs,
        type: "button",
        "aria-current": ariaAttr(isSelected),
        "data-selected": dataAttr(isSelected),
        "data-focus": dataAttr(isFocused),
        "data-now": dataAttr(isCurrent),
        "aria-label": props.value,
        "data-value": props.value,
        "data-unit": "period",
        onClick(event) {
          if (event.defaultPrevented) return
          send({ type: "UNIT.CLICK", unit: "period", value: props.value })
        },
      })
    },
  }
}
