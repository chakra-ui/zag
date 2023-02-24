import {
  getMonthNames,
  getTodayDate,
  getWeekDates,
  isDateDisabled,
  isDateEqual,
  isDateInvalid,
  isDateOutsideVisibleRange,
  isDateUnavailable,
  isTodayDate,
  setMonth,
  setYear,
} from "@zag-js/date-utils"
import { EventKeyMap, getEventKey } from "@zag-js/dom-event"
import { ariaAttr, dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { getFormatter } from "./date-formatter"
import { parts } from "./date-picker.anatomy"
import { dom } from "./date-picker.dom"
import type { CellProps, Send, State } from "./date-picker.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const startDate = state.context.startValue
  const endDate = state.context.endValue
  const selectedDate = state.context.value
  const focusedDate = state.context.focusedValue

  const disabled = state.context.disabled
  const readonly = state.context.readonly

  const min = state.context.min
  const max = state.context.max
  const locale = state.context.locale
  const timeZone = state.context.timeZone

  const api = {
    /**
     * The month names in the year. Represented as an array of strings.
     */
    months: getMonthNames(locale),
    /**
     * The weeks of the month. Represented as an array of arrays of dates.
     */
    weeks: state.context.weeks,
    /**
     * The days of the week. Represented as an array of strings.
     */
    weekDays: getWeekDates(getTodayDate(timeZone), timeZone, locale).map((day: Date) => {
      return getFormatter(locale, { weekday: "short" }).format(day)
    }),
    /**
     * The human readable text for the visible range of dates.
     */
    visibleRangeText: "TODO",
    /**
     * The selected date.
     */
    value: selectedDate,
    /**
     * The selected date as a Date object.
     */
    valueAsDate: selectedDate?.toDate(timeZone),
    /**
     * The selected date as a string.
     */
    valueAsString: selectedDate?.toString(),
    /**
     * The focused date.
     */
    focusedValue: focusedDate,
    /**
     * The focused date as a Date object.
     */
    focusedValueAsDate: focusedDate?.toDate(timeZone),
    /**
     * The focused date as a string.
     */
    focusedValueAsString: focusedDate?.toString(),
    /**
     * Function to set the selected month.
     */
    setMonth(month: number) {
      const date = setMonth(selectedDate ?? getTodayDate(timeZone), month)
      send({ type: "VALUE.SET", date })
    },
    /**
     * Function to set the selected year.
     */
    setYear(year: number) {
      const date = setYear(selectedDate ?? getTodayDate(timeZone), year)
      send({ type: "VALUE.SET", date })
    },
    /**
     * Returns the state details for a given cell.
     */
    getCellState(props: CellProps) {
      const { date, disabled } = props
      const cellState = {
        isInvalid: isDateInvalid(date, min, max),
        isDisabled: isDateDisabled(date, startDate, endDate, min, max),
        isSelected: isDateEqual(date, selectedDate),
        isUnavailable: isDateUnavailable(date, state.context.isDateUnavailable, min, max) && !disabled,
        isOutsideRange: isDateOutsideVisibleRange(date, startDate, endDate),
        isFocused: isDateEqual(date, focusedDate),
        isToday: isTodayDate(date, timeZone),
        get isSelectable() {
          return !cellState.isDisabled && !cellState.isUnavailable
        },
      }
      return cellState
    },

    rootProps: normalize.element({
      role: "group",
      "aria-label": "TODO",
      ...parts.root.attrs,
      id: dom.getRootId(state.context),
    }),

    gridProps: normalize.element({
      ...parts.grid.attrs,
      role: "grid",
      id: dom.getGridId(state.context),
      "aria-readonly": ariaAttr(readonly),
      "aria-disabled": ariaAttr(disabled),
      tabIndex: -1,
      onKeyDown(event) {
        const keyMap: EventKeyMap = {
          Enter() {
            send("GRID.ENTER")
          },
          ArrowLeft() {
            send("GRID.ARROW_LEFT")
          },
          ArrowRight() {
            send("GRID.ARROW_RIGHT")
          },
          ArrowUp() {
            send("GRID.ARROW_UP")
          },
          ArrowDown() {
            send("GRID.ARROW_DOWN")
          },
          PageUp(event) {
            send({ type: "GRID.PAGE_UP", larger: event.shiftKey })
          },
          PageDown(event) {
            send({ type: "GRID.PAGE_DOWN", larger: event.shiftKey })
          },
        }

        const exec = keyMap[getEventKey(event, state.context)]

        if (exec) {
          exec(event)
          event.preventDefault()
          event.stopPropagation()
        }
      },
      onPointerDown() {
        send({ type: "GRID.POINTER_DOWN" })
      },
      onPointerUp() {
        send({ type: "GRID.POINTER_UP" })
      },
    }),

    getCellProps(props: CellProps) {
      const cellState = api.getCellState(props)
      return normalize.element({
        ...parts.cell.attrs,
        role: "gridcell",
        id: dom.getCellId(state.context, props.date.toString()),
        "aria-disabled": ariaAttr(!cellState.isSelectable),
        "aria-selected": ariaAttr(cellState.isSelected),
        "aria-invalid": ariaAttr(cellState.isInvalid),
      })
    },

    getCellTriggerProps(props: CellProps) {
      const cellState = api.getCellState(props)
      return normalize.element({
        ...parts.cellTrigger.attrs,
        id: dom.getCellTriggerId(state.context, props.date.toString()),
        role: "button",
        tabIndex: cellState.isFocused ? 0 : -1,
        "aria-disabled": !cellState.isSelectable,
        "aria-label": "TODO",
        "aria-invalid": ariaAttr(cellState.isInvalid),
        "data-today": dataAttr(cellState.isToday),
        "data-selected": dataAttr(cellState.isSelected),
        "data-focused": dataAttr(cellState.isFocused),
        "data-disabled": dataAttr(cellState.isDisabled),
        "data-unavailable": dataAttr(cellState.isUnavailable),
        "data-invalid": dataAttr(cellState.isInvalid),
        "data-outside-range": dataAttr(cellState.isOutsideRange),
        onContextMenu(event) {
          event.preventDefault()
        },
        onFocus() {
          if (disabled) return
          send({ type: "CELL.FOCUS", date: props.date })
        },
        onPointerUp() {
          send({ type: "CELL.CLICK", date: props.date })
        },
      })
    },

    nextTriggerProps: normalize.button({
      ...parts.nextTrigger.attrs,
      id: dom.getNextTriggerId(state.context),
      type: "button",
      onClick() {
        send("GOTO.NEXT")
      },
      "aria-label": "TODO",
      disabled: !state.context.isNextVisibleRangeValid,
    }),

    prevTriggerProps: normalize.button({
      ...parts.prevTrigger.attrs,
      id: dom.getPrevTriggerId(state.context),
      type: "button",
      onClick() {
        send("GOTO.PREV")
      },
      "aria-label": "TODO",
      disabled: !state.context.isPrevVisibleRangeValid,
    }),

    clearTriggerProps: normalize.button({
      ...parts.clearTrigger.attrs,
      id: dom.getClearTriggerId(state.context),
      type: "button",
      hidden: state.context.value == null,
      onClick() {
        send("VALUE.CLEAR")
      },
    }),

    triggerProps: normalize.button({
      ...parts.trigger.attrs,
      id: dom.getTriggerId(state.context),
      type: "button",
      onClick() {
        send("TRIGGER.CLICK")
      },
    }),

    inputProps: normalize.input({
      ...parts.field.attrs,
      id: dom.getInputId(state.context),
      autoComplete: "off",
      autoCorrect: "off",
      spellCheck: "false",
      onChange(event) {
        send({ type: "INPUT.TYPE", value: event.target.value })
      },
    }),
  }

  return api
}
