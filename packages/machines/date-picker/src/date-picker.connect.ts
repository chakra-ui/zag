import {
  getDecadeRange,
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
import { chunk } from "@zag-js/utils"
import { getFormatter } from "./date-formatter"
import { parts } from "./date-picker.anatomy"
import { dom } from "./date-picker.dom"
import type { DateView, DayCellProps, Send, State, TriggerProps } from "./date-picker.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const startValue = state.context.startValue
  const endValue = state.context.endValue
  const selectedValue = state.context.value
  const focusedValue = state.context.focusedValue

  const disabled = state.context.disabled
  const readonly = state.context.readonly

  const min = state.context.min
  const max = state.context.max
  const locale = state.context.locale
  const timeZone = state.context.timeZone

  const api = {
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
    value: selectedValue,

    /**
     * The selected date as a Date object.
     */
    valueAsDate: selectedValue.map((date) => date.toDate(timeZone)),

    /**
     * The selected date as a string.
     */
    valueAsString: selectedValue.map((date) => date.toString()),

    /**
     * The focused date.
     */
    focusedValue: focusedValue,

    /**
     * The focused date as a Date object.
     */
    focusedValueAsDate: focusedValue?.toDate(timeZone),

    /**
     * The focused date as a string.
     */
    focusedValueAsString: focusedValue?.toString(),

    /**
     * Function to set the selected month.
     */
    focusMonth(month: number) {
      const date = setMonth(focusedValue ?? getTodayDate(timeZone), month)
      send({ type: "FOCUS.SET", date })
    },

    /**
     * Function to set the selected year.
     */
    focusYear(year: number) {
      const date = setYear(focusedValue ?? getTodayDate(timeZone), year)
      send({ type: "FOCUS.SET", date })
    },

    /**
     * Returns the state details for a given cell.
     */
    getCellState(props: DayCellProps) {
      const { value, disabled } = props
      const cellState = {
        isInvalid: isDateInvalid(value, min, max),
        isDisabled: isDateDisabled(value, startValue, endValue, min, max),
        isSelected: !!selectedValue.find((date) => isDateEqual(value, date)),
        isUnavailable: isDateUnavailable(value, state.context.isDateUnavailable, min, max) && !disabled,
        isOutsideRange: isDateOutsideVisibleRange(value, startValue, endValue),
        isFocused: isDateEqual(value, focusedValue),
        isToday: isTodayDate(value, timeZone),
        get isSelectable() {
          return !cellState.isDisabled && !cellState.isUnavailable
        },
      }
      return cellState
    },

    /**
     * Returns the years of the decade based on the columns.
     * Represented as an array of arrays of years.
     */
    getYears(props: { columns?: number } = {}) {
      const { columns = 1 } = props
      return chunk(getDecadeRange(focusedValue.year), columns)
    },

    /**
     * Returns the months of the year based on the columns.
     * Represented as an array of arrays of months.
     */
    getMonths(props: { columns?: number } = {}) {
      const { columns = 1 } = props
      return chunk(getMonthNames(locale, "short"), columns)
    },

    rootProps: normalize.element({
      ...parts.root.attrs,
      id: dom.getRootId(state.context),
    }),

    getGridProps(props: { view?: DateView } = {}) {
      const { view = "day" } = props
      return normalize.element({
        ...parts.grid.attrs,
        role: "grid",
        id: dom.getGridId(state.context),
        "aria-readonly": ariaAttr(readonly),
        "aria-disabled": ariaAttr(disabled),
        "data-type": view,
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
            Home() {
              send("GRID.HOME")
            },
            End() {
              send("GRID.END")
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
      })
    },

    getDayCellProps(props: DayCellProps) {
      const { value } = props
      const cellState = api.getCellState(props)
      return normalize.element({
        ...parts.cellTrigger.attrs,
        role: "gridcell",
        tabIndex: cellState.isFocused ? 0 : -1,
        id: dom.getCellTriggerId(state.context, value.toString()),
        "aria-label": value.toString(),
        "aria-disabled": ariaAttr(!cellState.isSelectable),
        "aria-selected": ariaAttr(cellState.isSelected),
        "aria-invalid": ariaAttr(cellState.isInvalid),
        "data-value": value.toString(),
        "data-today": dataAttr(cellState.isToday),
        "data-focused": dataAttr(cellState.isFocused),
        "data-selected": dataAttr(cellState.isSelected),
        "data-disabled": dataAttr(cellState.isDisabled),
        "data-unavailable": dataAttr(cellState.isUnavailable),
        "data-outside-range": dataAttr(cellState.isOutsideRange),
        onFocus() {
          if (disabled) return
          send({ type: "CELL.FOCUS", cell: "day", date: value })
        },
        onPointerUp() {
          send({ type: "CELL.CLICK", cell: "day", date: value })
        },
      })
    },

    getMonthCellProps(props: { value: number }) {
      const { value } = props
      const isFocused = focusedValue.month === value
      return normalize.element({
        ...parts.cellTrigger.attrs,
        role: "gridcell",
        id: dom.getCellTriggerId(state.context, value.toString()),
        "data-focused": dataAttr(isFocused),
        "data-type": "month",
        "data-value": value,
        tabIndex: isFocused ? 0 : -1,
        onFocus() {
          if (disabled) return
          send({ type: "CELL.FOCUS", cell: "month", date: value })
        },
        onPointerUp() {
          send({ type: "CELL.CLICK", cell: "month", date: value })
        },
      })
    },

    getYearCellProps(props: { value: number }) {
      const { value } = props
      const isFocused = focusedValue.year === value
      return normalize.element({
        ...parts.cellTrigger.attrs,
        role: "gridcell",
        id: dom.getCellTriggerId(state.context, value.toString()),
        "data-focused": dataAttr(isFocused),
        "data-value": value,
        "data-type": "year",
        tabIndex: isFocused ? 0 : -1,
        onFocus() {
          if (disabled) return
          send({ type: "CELL.FOCUS", cell: "year", date: value })
        },
        onPointerUp() {
          send({ type: "CELL.CLICK", cell: "year", date: value })
        },
      })
    },

    getNextTriggerProps(props: TriggerProps = {}) {
      const { view = "day" } = props
      return normalize.button({
        ...parts.nextTrigger.attrs,
        id: dom.getNextTriggerId(state.context),
        type: "button",
        "aria-label": `Next ${view}`,
        disabled: !state.context.isNextVisibleRangeValid,
        onClick() {
          send("GOTO.NEXT")
        },
      })
    },

    getPrevTriggerProps(props: TriggerProps = {}) {
      const { view = "day" } = props
      return normalize.button({
        ...parts.prevTrigger.attrs,
        id: dom.getPrevTriggerId(state.context),
        type: "button",
        "aria-label": `Previous ${view}`,
        disabled: !state.context.isPrevVisibleRangeValid,
        onClick() {
          send("GOTO.PREV")
        },
      })
    },

    getHeaderProps(props: { view: DateView }) {
      const { view = "day" } = props
      return normalize.element({
        ...parts.header.attrs,
        "data-type": view,
        id: dom.getHeaderId(state.context),
      })
    },

    clearTriggerProps: normalize.button({
      ...parts.clearTrigger.attrs,
      id: dom.getClearTriggerId(state.context),
      type: "button",
      hidden: !state.context.value.length,
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

    viewTriggerProps: normalize.button({
      ...parts.viewTrigger.attrs,
      id: dom.getViewTriggerId(state.context),
      type: "button",
      onClick() {
        send("VIEW.CHANGE")
      },
    }),

    inputProps: normalize.input({
      ...parts.input.attrs,
      id: dom.getInputId(state.context),
      autoComplete: "off",
      autoCorrect: "off",
      spellCheck: "false",
      placeholder: "mm/dd/yyyy",
      onFocus() {
        send("INPUT.FOCUS")
      },
      onBlur(event) {
        send({ type: "INPUT.BLUR", value: event.target.value })
      },
      onKeyDown(event) {
        if (event.key === "Enter") {
          send("INPUT.ENTER")
        }
      },
      onChange(event) {
        send({ type: "INPUT.CHANGE", value: event.target.value })
      },
    }),

    monthSelectProps: normalize.select({
      ...parts.monthSelect.attrs,
      id: dom.getMonthSelectId(state.context),
      "aria-label": "Select month",
      defaultValue: focusedValue.month,
      onChange: (e) => {
        api.focusMonth(parseInt(e.target.value))
      },
    }),

    yearSelectProps: normalize.select({
      ...parts.yearSelect.attrs,
      id: dom.getYearSelectId(state.context),
      "aria-label": "Select year",
      defaultValue: focusedValue.year,
      onChange: (e) => {
        api.focusYear(parseInt(e.target.value))
      },
    }),
  }

  return api
}
