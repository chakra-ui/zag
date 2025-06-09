import { ariaAttr, dataAttr, getEventKey, isComposingEvent } from "@zag-js/dom-query"
import { getPlacementStyles } from "@zag-js/popper"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./time-picker.anatomy"
import * as dom from "./time-picker.dom"
import type { CellProps, PeriodCellProps, TimePickerApi, TimePickerService } from "./time-picker.types"
import { getPlaceholder, isInRange } from "./utils/assertion"
import { valueToCell } from "./utils/conversion"
import { getHourFormat } from "./utils/hour-format"
import { getHours, getMinutes, getSeconds } from "./utils/range"

export function connect<T extends PropTypes>(
  service: TimePickerService,
  normalize: NormalizeProps<T>,
): TimePickerApi<T> {
  const { state, send, prop, computed, scope, context } = service

  const disabled = prop("disabled")
  const readOnly = prop("readOnly")

  const locale = prop("locale")
  const hourFormat = getHourFormat(locale)
  const hour12 = hourFormat.is12Hour

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

  function getHourCellState(props: CellProps) {
    const hour = props.value
    const period = hourFormat.getPeriod(value?.hour ?? currentTime?.hour)
    const hour24 = hourFormat.to24Hour(hour, period)
    return {
      selectable: isInRange(hour24, min?.hour, max?.hour),
      selected: value?.hour === hour24,
      current: currentTime?.hour === hour24,
      focused: focusedColumn === "hour" && context.get("focusedValue") === hour,
    }
  }

  function getMinuteCellState(props: CellProps) {
    const minute = props.value
    return {
      selectable: isInRange(minute, min?.minute, max?.minute),
      selected: value?.minute === minute,
      current: currentTime?.minute === minute,
      focused: focusedColumn === "minute" && context.get("focusedValue") === minute,
    }
  }

  function getSecondCellState(props: CellProps) {
    const second = props.value
    return {
      selectable: isInRange(second, min?.second, max?.second),
      selected: value?.second === second,
      current: currentTime?.second === second,
      focused: focusedColumn === "second" && context.get("focusedValue") === second,
    }
  }

  function getPeriodCellState(props: PeriodCellProps) {
    const period = props.value
    const currentPeriod = hourFormat.getPeriod(currentTime?.hour)
    return {
      selectable: true,
      selected: hourFormat.is12Hour ? hourFormat.getPeriod(value?.hour) === period : false,
      current: currentPeriod === period,
      focused: focusedColumn === "period" && context.get("focusedValue") === period,
    }
  }

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
      return getHours(locale, steps?.hour).map(valueToCell)
    },
    getMinutes() {
      return getMinutes(steps?.minute).map(valueToCell)
    },
    getSeconds() {
      return getSeconds(steps?.second).map(valueToCell)
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
        placeholder: prop("placeholder") ?? getPlaceholder(prop("allowSeconds"), locale),
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

    getHourCellState,
    getHourCellProps(props) {
      const hour = props.value

      const period = hourFormat.getPeriod(value?.hour ?? currentTime?.hour)
      const hour24 = hourFormat.to24Hour(hour, period)

      const selectable = isInRange(hour24, min?.hour, max?.hour)
      const selected = value?.hour === hour24
      const current = currentTime?.hour === hour24
      const focused = focusedColumn === "hour" && context.get("focusedValue") === hour

      return normalize.button({
        ...parts.cell.attrs,
        type: "button",
        "aria-disabled": ariaAttr(!selectable),
        "data-disabled": dataAttr(!selectable),
        "aria-current": ariaAttr(selected),
        "data-selected": dataAttr(selected),
        "data-now": dataAttr(current),
        "data-focus": dataAttr(focused),
        "aria-label": `${hour} hours`,
        "data-value": hour,
        "data-unit": "hour",
        onClick(event) {
          if (event.defaultPrevented) return
          if (!selectable) return
          send({ type: "UNIT.CLICK", unit: "hour", value: hour })
        },
      })
    },

    getMinuteCellState,
    getMinuteCellProps(props) {
      const minute = props.value
      const value = context.get("value")

      const selectable = isInRange(minute, min?.minute, max?.minute)
      const selected = value?.minute === minute
      const current = currentTime?.minute === minute
      const focused = focusedColumn === "minute" && context.get("focusedValue") === minute

      return normalize.button({
        ...parts.cell.attrs,
        type: "button",
        "aria-disabled": ariaAttr(!selectable),
        "data-disabled": dataAttr(!selectable),
        "aria-current": ariaAttr(selected),
        "data-selected": dataAttr(selected),
        "aria-label": `${minute} minutes`,
        "data-value": minute,
        "data-now": dataAttr(current),
        "data-focus": dataAttr(focused),
        "data-unit": "minute",
        onClick(event) {
          if (event.defaultPrevented) return
          if (!selectable) return
          send({ type: "UNIT.CLICK", unit: "minute", value: minute })
        },
      })
    },

    getSecondCellState,
    getSecondCellProps(props) {
      const second = props.value

      const selectable = isInRange(second, min?.second, max?.second)
      const selected = value?.second === second
      const current = currentTime?.second === second
      const focused = focusedColumn === "second" && context.get("focusedValue") === second

      return normalize.button({
        ...parts.cell.attrs,
        type: "button",
        "aria-disabled": ariaAttr(!selectable),
        "data-disabled": dataAttr(!selectable),
        "aria-current": ariaAttr(selected),
        "data-selected": dataAttr(selected),
        "aria-label": `${second} seconds`,
        "data-value": second,
        "data-unit": "second",
        "data-focus": dataAttr(focused),
        "data-now": dataAttr(current),
        onClick(event) {
          if (event.defaultPrevented) return
          if (!selectable) return
          send({ type: "UNIT.CLICK", unit: "second", value: second })
        },
      })
    },

    getPeriodCellState,
    getPeriodCellProps(props) {
      const isSelected = hourFormat.is12Hour ? hourFormat.getPeriod(value?.hour) === props.value : false
      const currentPeriod = hourFormat.getPeriod(currentTime?.hour)
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
