import { ariaAttr, dataAttr, getEventKey, isComposingEvent } from "@zag-js/dom-query"
import { getPlacementStyles } from "@zag-js/popper"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./time-picker.anatomy"
import * as dom from "./time-picker.dom"
import type { TimePickerApi, TimePickerService } from "./time-picker.types"
import {
  get12HourFormatPeriodHour,
  getHourPeriod,
  getInputPlaceholder,
  is12HourFormat,
  padTime,
} from "./time-picker.utils"

export function connect<T extends PropTypes>(
  service: TimePickerService,
  normalize: NormalizeProps<T>,
): TimePickerApi<T> {
  const { state, send, prop, computed, scope, context } = service

  const disabled = prop("disabled")
  const readOnly = prop("readOnly")

  const locale = prop("locale")
  const hour12 = is12HourFormat(locale)

  const min = prop("min")
  const max = prop("max")
  const steps = prop("steps")

  const focused = state.matches("focused")
  const open = state.hasTag("open")

  const value = context.get("value")
  const valueAsString = computed("valueAsString")
  const currentTime = context.get("currentTime")
  const focusedColumn = context.get("focusedColumn")

  const currentPlacement = context.get("currentPlacement")
  const popperStyles = getPlacementStyles({
    ...prop("positioning"),
    placement: currentPlacement,
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
      const open = state.hasTag("open")
      if (open === nextOpen) return
      send({ type: nextOpen ? "OPEN" : "CLOSE" })
    },
    setUnitValue(unit, value) {
      send({ type: "UNIT.SET", unit, value })
    },
    setValue(value) {
      send({ type: "VALUE.SET", value })
    },
    clearValue() {
      send({ type: "VALUE.CLEAR" })
    },
    getHours() {
      const length = hour12 ? 12 : 24
      const arr = Array.from({ length }, (_, i) => i)
      const step = steps?.hour
      const hours = step != null ? arr.filter((hour) => hour % step === 0) : arr
      return hours.map((value) => ({ label: hour12 && value === 0 ? "12" : padTime(value), value }))
    },
    getMinutes() {
      const arr = Array.from({ length: 60 }, (_, i) => i)
      const step = steps?.minute
      const minutes = step != null ? arr.filter((minute) => minute % step === 0) : arr
      return minutes.map((value) => ({ label: padTime(value), value }))
    },
    getSeconds() {
      const arr = Array.from({ length: 60 }, (_, i) => i)
      const step = steps?.second
      const seconds = step != null ? arr.filter((second) => second % step === 0) : arr
      return seconds.map((value) => ({ label: padTime(value), value }))
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
        dir: prop("dir"),
        htmlFor: dom.getInputId(scope),
        "data-state": open ? "open" : "closed",
        "data-disabled": dataAttr(disabled),
        "data-readonly": dataAttr(readOnly),
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs,
        dir: prop("dir"),
        id: dom.getControlId(scope),
        "data-disabled": dataAttr(disabled),
      })
    },

    getInputProps() {
      return normalize.input({
        ...parts.input.attrs,
        dir: prop("dir"),
        autoComplete: "off",
        autoCorrect: "off",
        spellCheck: "false",
        id: dom.getInputId(scope),
        name: prop("name"),
        defaultValue: valueAsString,
        placeholder: getInputPlaceholder(prop("placeholder"), prop("allowSeconds"), locale),
        disabled,
        readOnly,
        onFocus() {
          send({ type: "INPUT.FOCUS" })
        },
        onBlur(event) {
          send({ type: "INPUT.BLUR", value: event.currentTarget.value })
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
        id: dom.getTriggerId(scope),
        type: "button",
        "data-placement": currentPlacement,
        disabled,
        "data-readonly": dataAttr(readOnly),
        "aria-label": open ? "Close calendar" : "Open calendar",
        "aria-controls": dom.getContentId(scope),
        "data-state": open ? "open" : "closed",
        onClick(event) {
          if (event.defaultPrevented) return
          send({ type: "TRIGGER.CLICK" })
        },
      })
    },

    getClearTriggerProps() {
      return normalize.button({
        ...parts.clearTrigger.attrs,
        id: dom.getClearTriggerId(scope),
        type: "button",
        hidden: !value,
        disabled,
        "data-readonly": dataAttr(readOnly),
        "aria-label": "Clear time",
        onClick(event) {
          if (event.defaultPrevented) return
          send({ type: "VALUE.CLEAR" })
        },
      })
    },

    getPositionerProps() {
      return normalize.element({
        ...parts.positioner.attrs,
        dir: prop("dir"),
        id: dom.getPositionerId(scope),
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
        dir: prop("dir"),
        id: dom.getContentId(scope),
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
              if (!prop("disableLayer")) return
              send({ type: "CONTENT.ESCAPE" })
            },
          }

          const exec = keyMap[getEventKey(event, { dir: prop("dir") })]

          if (exec) {
            exec(event)
            event.preventDefault()
          }
        },
      })
    },

    getColumnProps(props) {
      const hidden = (props.unit === "second" && !prop("allowSeconds")) || (props.unit === "period" && !hour12)
      return normalize.element({
        ...parts.column.attrs,
        id: dom.getColumnId(scope, props.unit),
        "data-unit": props.unit,
        "data-focus": dataAttr(focusedColumn === props.unit),
        hidden,
      })
    },

    getHourCellProps(props) {
      const hour = props.value
      const isSelectable = !(
        (min && get12HourFormatPeriodHour(hour, computed("period")) < min.hour) ||
        (max && get12HourFormatPeriodHour(hour, computed("period")) > max.hour)
      )
      const isSelected = value?.hour === get12HourFormatPeriodHour(hour, computed("period"))
      const isFocused = focusedColumn === "hour" && context.get("focusedValue") === hour

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
      const value = context.get("value")
      const minMinute = min?.set({ second: 0 })
      const maxMinute = max?.set({ second: 0 })

      const isSelectable = !(
        (minMinute && value && minMinute.compare(value.set({ minute })) > 0) ||
        (maxMinute && value && maxMinute.compare(value.set({ minute })) < 0)
      )
      const isSelected = value?.minute === minute
      const isCurrent = currentTime?.minute === minute
      const isFocused = focusedColumn === "minute" && context.get("focusedValue") === minute

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
      const isSelected = value?.second === second
      const isCurrent = currentTime?.second === second
      const isFocused = focusedColumn === "second" && context.get("focusedValue") === second

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
      const isSelected = computed("period") === props.value
      const currentPeriod = getHourPeriod(currentTime?.hour, locale)
      const isCurrent = currentPeriod === props.value
      const isFocused = focusedColumn === "period" && context.get("focusedValue") === props.value

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
