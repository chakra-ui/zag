import { CalendarDate, isWeekend } from "@internationalized/date"
import {
  getDayFormatter,
  getDecadeRange,
  getMonthDates,
  getMonthFormatter,
  getMonthNames,
  getTodayDate,
  getWeekDays,
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
import { parts } from "./date-picker.anatomy"
import { dom } from "./date-picker.dom"
import type { DateView, DayCellProps, Send, State, TriggerProps } from "./date-picker.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const startValue = state.context.startValue
  const endValue = state.context.endValue
  const selectedValue = state.context.value
  const focusedValue = state.context.focusedValue

  const disabled = state.context.disabled
  const readOnly = state.context.readOnly

  const min = state.context.min
  const max = state.context.max
  const locale = state.context.locale
  const timeZone = state.context.timeZone

  const isFocused = state.matches("focused")
  const isOpen = state.matches("open")

  const api = {
    /**
     * Whether the input is focused
     */
    isFocused,
    /**
     * Whether the date picker is open
     */
    isOpen,
    /**
     * The current view of the date picker
     */
    view: state.context.view,

    /**
     * The weeks of the month. Represented as an array of arrays of dates.
     */
    weeks: getMonthDates(state.context.startValue, state.context.visibleDuration, locale),

    /**
     * The days of the week. Represented as an array of strings.
     */
    weekDays: getWeekDays(getTodayDate(timeZone), timeZone, locale),

    /**
     * The human readable text for the visible range of dates.
     */
    visibleRangeText: state.context.visibleRangeText,

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
     *  Sets the selected date to today.
     */
    selectToday() {
      const value = getTodayDate(timeZone)
      send({ type: "VALUE.SET", value })
    },

    /**
     * Sets the selected date to the given date.
     */
    setValue(value: CalendarDate[]) {
      console.log(value)
    },

    /**
     * Sets the focused date to the given date.
     */
    setFocusedValue(value: CalendarDate) {
      send({ type: "FOCUS.SET", value })
    },

    /**
     * Clears the selected date(s).
     */
    clearValue() {},

    /**
     * Function to open the calendar.
     */
    open() {},

    /**
     * Function to close the calendar.
     */
    close() {},

    /**
     * Function to set the selected month.
     */
    focusMonth(month: number) {
      const value = setMonth(focusedValue ?? getTodayDate(timeZone), month)
      send({ type: "FOCUS.SET", value })
    },

    /**
     * Function to set the selected year.
     */
    focusYear(year: number) {
      const value = setYear(focusedValue ?? getTodayDate(timeZone), year)
      send({ type: "FOCUS.SET", value })
    },

    visibleRange: state.context.visibleRange,

    /**
     * Returns the state details for a given cell.
     */
    getDayCellState(props: DayCellProps) {
      const { value, disabled } = props
      const formatter = getDayFormatter(locale, timeZone)
      const cellState = {
        isInvalid: isDateInvalid(value, min, max),
        isDisabled: isDateDisabled(value, startValue, endValue, min, max),
        isSelected: !!selectedValue.find((date) => isDateEqual(value, date)),
        isUnavailable: isDateUnavailable(value, state.context.isDateUnavailable, min, max) && !disabled,
        isOutsideRange: isDateOutsideVisibleRange(value, startValue, endValue),
        isFocused: isDateEqual(value, focusedValue),
        isToday: isTodayDate(value, timeZone),
        isWeekend: isWeekend(value, locale),
        valueText: formatter.format(value.toDate(timeZone)),
        get ariaLabel() {
          if (cellState.isUnavailable) return `Not available. ${cellState.valueText}`
          if (cellState.isSelected) return `Selected date. ${cellState.valueText}`
          return `Choose ${cellState.valueText}`
        },
        get isSelectable() {
          return !cellState.isInvalid && !cellState.isDisabled && !cellState.isUnavailable
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
     * Returns the start and end years of the decade.
     */
    getDecade() {
      const years = getDecadeRange(focusedValue.year)
      return { start: years.at(0), end: years.at(-1) }
    },

    /**
     * Returns the months of the year based on the columns.
     * Represented as an array of arrays of months.
     */
    getMonths(props: { columns?: number; format?: "short" | "long" } = {}) {
      const { columns = 1, format } = props
      return chunk(getMonthNames(locale, format), columns)
    },

    controlProps: normalize.element({
      ...parts.control.attrs,
      id: dom.getControlId(state.context),
      "data-disabled": dataAttr(disabled),
    }),

    contentProps: normalize.element({
      ...parts.content.attrs,
      hidden: !isOpen,
      id: dom.getContentId(state.context),
      role: "application",
      "aria-roledescription": "datepicker",
      "aria-label": "calendar",
    }),

    getGridProps(props: { view?: DateView; columns?: number } = {}) {
      const { view = "day", columns = view === "day" ? 7 : 4 } = props
      return normalize.element({
        ...parts.grid.attrs,
        role: "grid",
        "data-columns": columns,
        "aria-roledescription": getRoleDescription(view),
        id: dom.getGridId(state.context, view),
        "aria-readonly": ariaAttr(readOnly),
        "aria-disabled": ariaAttr(disabled),
        "aria-multiselectable": ariaAttr(state.context.selectionMode !== "single"),
        "data-type": view,
        dir: state.context.dir,
        tabIndex: -1,
        onKeyDown(event) {
          const keyMap: EventKeyMap = {
            Enter() {
              send({ type: "GRID.ENTER", view, columns })
            },
            ArrowLeft() {
              send({ type: "GRID.ARROW_LEFT", view, columns, focus: true })
            },
            ArrowRight() {
              send({ type: "GRID.ARROW_RIGHT", view, columns, focus: true })
            },
            ArrowUp() {
              send({ type: "GRID.ARROW_UP", view, columns, focus: true })
            },
            ArrowDown() {
              send({ type: "GRID.ARROW_DOWN", view, columns, focus: true })
            },
            PageUp(event) {
              send({ type: "GRID.PAGE_UP", larger: event.shiftKey, view, columns, focus: true })
            },
            PageDown(event) {
              send({ type: "GRID.PAGE_DOWN", larger: event.shiftKey, view, columns, focus: true })
            },
            Home() {
              send({ type: "GRID.HOME", view, columns, focus: true })
            },
            End() {
              send({ type: "GRID.END", view, columns, focus: true })
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
          send({ type: "GRID.POINTER_DOWN", view })
        },
        onPointerUp() {
          send({ type: "GRID.POINTER_UP", view })
        },
      })
    },

    getDayCellProps(props: DayCellProps) {
      const { value } = props
      const cellState = api.getDayCellState(props)
      return normalize.element({
        ...parts.cellTrigger.attrs,
        role: "gridcell",
        tabIndex: cellState.isFocused ? 0 : -1,
        id: dom.getCellTriggerId(state.context, value.toString()),
        "aria-label": cellState.ariaLabel,
        "aria-disabled": ariaAttr(!cellState.isSelectable),
        "data-disabled": dataAttr(!cellState.isSelectable),
        "aria-selected": ariaAttr(cellState.isSelected),
        "data-selected": dataAttr(cellState.isSelected),
        "aria-invalid": ariaAttr(cellState.isInvalid),
        "data-value": value.toString(),
        "data-today": dataAttr(cellState.isToday),
        "aria-current": cellState.isToday ? "date" : undefined,
        "data-focused": dataAttr(cellState.isFocused),
        "data-unavailable": dataAttr(cellState.isUnavailable),
        "data-outside-range": dataAttr(cellState.isOutsideRange),
        "data-weekend": dataAttr(cellState.isWeekend),
        onClick() {
          if (!cellState.isSelectable) return
          send({ type: "CELL.CLICK", cell: "day", value })
        },
        onContextMenu(event) {
          event.preventDefault()
        },
      })
    },

    getMonthCellState(props: { value: number }) {
      const { value } = props
      const normalized = focusedValue.set({ month: value })
      const formatter = getMonthFormatter(locale, timeZone)
      return {
        isFocused: focusedValue.month === props.value,
        isSelectable: !isDateInvalid(normalized, min, max),
        isSelected: !!selectedValue.find((date) => date.month === value && date.year === focusedValue.year),
        valueText: formatter.format(normalized.toDate(timeZone)),
      }
    },

    getMonthCellProps(props: { value: number }) {
      const { value } = props
      const cellState = api.getMonthCellState(props)
      return normalize.element({
        ...parts.cellTrigger.attrs,
        role: "gridcell",
        id: dom.getCellTriggerId(state.context, value.toString()),
        "aria-selected": ariaAttr(cellState.isSelected),
        "data-selected": dataAttr(cellState.isSelected),
        "aria-disabled": ariaAttr(!cellState.isSelectable),
        "data-disabled": dataAttr(!cellState.isSelectable),
        "data-focused": dataAttr(cellState.isFocused),
        "aria-label": cellState.valueText,
        "data-type": "month",
        "data-value": value,
        tabIndex: cellState.isFocused ? 0 : -1,
        onClick() {
          if (!cellState.isSelectable) return
          send({ type: "CELL.CLICK", cell: "month", value })
        },
        onContextMenu(event) {
          event.preventDefault()
        },
      })
    },

    getYearCellState(props: { value: number }) {
      const { value } = props
      const normalized = focusedValue.set({ year: value })
      return {
        isFocused: focusedValue.year === props.value,
        isSelectable: !isDateInvalid(normalized, min, max),
        isSelected: !!selectedValue.find((date) => date.year === value),
        valueText: value.toString(),
      }
    },

    getYearCellProps(props: { value: number }) {
      const { value } = props
      const cellState = api.getYearCellState(props)
      return normalize.element({
        ...parts.cellTrigger.attrs,
        role: "gridcell",
        id: dom.getCellTriggerId(state.context, value.toString()),
        "aria-selected": ariaAttr(cellState.isSelected),
        "data-selected": dataAttr(cellState.isSelected),
        "data-focused": dataAttr(cellState.isFocused),
        "aria-disabled": ariaAttr(!cellState.isSelectable),
        "data-disabled": dataAttr(!cellState.isSelectable),
        "aria-label": cellState.valueText,
        "data-value": value,
        "data-type": "year",
        tabIndex: cellState.isFocused ? 0 : -1,
        onClick() {
          if (!cellState.isSelectable) return
          send({ type: "CELL.CLICK", cell: "year", value })
        },
        onContextMenu(event) {
          event.preventDefault()
        },
      })
    },

    getNextTriggerProps(props: TriggerProps = {}) {
      const { view = "day" } = props
      return normalize.button({
        ...parts.nextTrigger.attrs,
        id: dom.getNextTriggerId(state.context, view),
        type: "button",
        "aria-label": getPrevTriggerLabel(view),
        disabled: !state.context.isNextVisibleRangeValid,
        onClick() {
          send({ type: "GOTO.NEXT", view })
        },
      })
    },

    getPrevTriggerProps(props: TriggerProps = {}) {
      const { view = "day" } = props
      return normalize.button({
        ...parts.prevTrigger.attrs,
        id: dom.getPrevTriggerId(state.context, view),
        type: "button",
        "aria-label": getNextTriggerLabel(view),
        disabled: !state.context.isPrevVisibleRangeValid,
        onClick() {
          send({ type: "GOTO.PREV", view })
        },
      })
    },

    getHeaderProps(props: { view?: DateView } = {}) {
      const { view = "day" } = props
      return normalize.element({
        ...parts.header.attrs,
        "aria-hidden": true,
        dir: state.context.dir,
        "data-type": view,
        id: dom.getHeaderId(state.context),
      })
    },

    clearTriggerProps: normalize.button({
      ...parts.clearTrigger.attrs,
      id: dom.getClearTriggerId(state.context),
      type: "button",
      "aria-label": "Clear dates",
      hidden: !state.context.value.length,
      onClick() {
        send("VALUE.CLEAR")
      },
    }),

    triggerProps: normalize.button({
      ...parts.trigger.attrs,
      id: dom.getTriggerId(state.context),
      type: "button",
      "aria-label": isOpen ? "Close calendar" : "Open calendar",
      "aria-haspopup": "grid",
      onClick() {
        send("TRIGGER.CLICK")
      },
    }),

    viewTriggerProps: normalize.button({
      ...parts.viewTrigger.attrs,
      id: dom.getViewTriggerId(state.context),
      type: "button",
      "aria-label": getViewTriggerLabel(state.context.view),
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
      dir: state.context.dir,
      name: state.context.name,
      placeholder: "MM/DD/YYYY",
      defaultValue: state.context.inputValue,
      onFocus() {
        send("INPUT.FOCUS")
      },
      onBlur(event) {
        send({ type: "INPUT.BLUR", value: event.currentTarget.value })
      },
      onKeyDown(event) {
        if (event.key === "Enter") {
          send({ type: "INPUT.ENTER", value: event.currentTarget.value })
        }
      },
      onChange(event) {
        send({ type: "INPUT.CHANGE", value: event.currentTarget.value })
      },
    }),

    monthSelectProps: normalize.select({
      ...parts.monthSelect.attrs,
      id: dom.getMonthSelectId(state.context),
      "aria-label": "Select month",
      dir: state.context.dir,
      defaultValue: focusedValue.month,
      onChange: (e) => {
        api.focusMonth(parseInt(e.target.value))
      },
    }),

    yearSelectProps: normalize.select({
      ...parts.yearSelect.attrs,
      id: dom.getYearSelectId(state.context),
      "aria-label": "Select year",
      dir: state.context.dir,
      defaultValue: focusedValue.year,
      onChange: (e) => {
        api.focusYear(parseInt(e.target.value))
      },
    }),
  }

  return api
}

function matchView<T>(view: DateView, values: { year: T; month: T; day: T }) {
  if (view === "year") return values.year
  if (view === "month") return values.month
  return values.day
}

function getNextTriggerLabel(view: DateView) {
  return matchView(view, {
    year: "Switch to next decade",
    month: "Switch to next year",
    day: "Switch to next month",
  })
}

function getPrevTriggerLabel(view: DateView) {
  return matchView(view, {
    year: "Switch to previous decade",
    month: "Switch to previous year",
    day: "Switch to previous month",
  })
}

function getRoleDescription(view: DateView) {
  return matchView(view, {
    year: "calendar decade",
    month: "calendar year",
    day: "calendar month",
  })
}

function getViewTriggerLabel(view: DateView) {
  return matchView(view, {
    year: "Switch to month view",
    month: "Switch to day view",
    day: "Switch to year view",
  })
}
