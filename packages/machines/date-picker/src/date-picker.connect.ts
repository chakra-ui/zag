import { DateFormatter, isWeekend, type CalendarDate, type DateValue } from "@internationalized/date"
import {
  constrainValue,
  getDayFormatter,
  getDaysInWeek,
  getDecadeRange,
  getMonthDays,
  getMonthFormatter,
  getMonthNames,
  getTodayDate,
  getUnitDuration,
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
import { getEventKey, getNativeEvent, type EventKeyMap } from "@zag-js/dom-event"
import { ariaAttr, dataAttr } from "@zag-js/dom-query"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { chunk } from "@zag-js/utils"
import { parts } from "./date-picker.anatomy"
import { dom } from "./date-picker.dom"
import type {
  CellProps,
  DateView,
  DayCellProps,
  GridProps,
  Offset,
  MachineApi,
  Send,
  State,
  ViewProps,
} from "./date-picker.types"
import {
  adjustStartAndEndDate,
  ensureValidCharacters,
  getInputPlaceholder,
  getLocaleSeparator,
  getNextTriggerLabel,
  getPrevTriggerLabel,
  getRoleDescription,
  getViewTriggerLabel,
  isDateWithinRange,
  isValidCharacter,
  matchView,
} from "./date-picker.utils"

const pretty = (value: DateValue) => value.toString().split("T")[0]

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const startValue = state.context.startValue
  const endValue = state.context.endValue
  const selectedValue = state.context.value
  const focusedValue = state.context.focusedValue
  const hoveredValue = state.context.hoveredValue
  const hoveredRangeValue = hoveredValue ? adjustStartAndEndDate([selectedValue[0], hoveredValue]) : []

  const disabled = state.context.disabled
  const readOnly = state.context.readOnly
  const isInteractive = state.context.isInteractive

  const min = state.context.min
  const max = state.context.max
  const locale = state.context.locale
  const timeZone = state.context.timeZone
  const startOfWeek = state.context.startOfWeek

  const isFocused = state.matches("focused")
  const isOpen = state.matches("open") || state.context.inline
  const isRangePicker = state.context.selectionMode === "range"
  const isDateUnavailableFn = state.context.isDateUnavailable

  const currentPlacement = state.context.currentPlacement
  const popperStyles = getPlacementStyles({
    ...state.context.positioning,
    placement: currentPlacement,
  })

  const defaultOffset: Offset = {
    amount: 0,
    visibleRange: state.context.visibleRange,
  }

  const separator = getLocaleSeparator(locale)

  const api = {
    isFocused,
    isOpen,
    view: state.context.view,

    matchView,

    getDaysInWeek(weekIndex: number, from = startValue) {
      return getDaysInWeek(weekIndex, from, locale, startOfWeek)
    },

    getOffset(months: number) {
      const from = startValue.add({ months })
      return {
        amount: months,
        visibleRange: { start: from, end: endValue.add({ months }) },
        weeks: api.getMonthDays(from),
      }
    },

    getMonthDays(from = startValue) {
      const numOfWeeks = state.context.fixedWeeks ? 6 : undefined
      return getMonthDays(from, locale, numOfWeeks, startOfWeek)
    },

    isUnavailable(date: DateValue) {
      return isDateUnavailable(date, isDateUnavailableFn, locale, min, max)
    },

    get weeks() {
      return api.getMonthDays()
    },

    weekDays: getWeekDays(getTodayDate(timeZone), startOfWeek, timeZone, locale),
    visibleRangeText: state.context.visibleRangeText,
    value: selectedValue,
    valueAsDate: selectedValue.map((date) => date.toDate(timeZone)),
    valueAsString: selectedValue.map(pretty),
    focusedValue: focusedValue,
    focusedValueAsDate: focusedValue?.toDate(timeZone),
    focusedValueAsString: pretty(focusedValue),

    selectToday() {
      const value = constrainValue(getTodayDate(timeZone), min, max)
      send({ type: "VALUE.SET", value })
    },

    setValue(values: CalendarDate[]) {
      const computedValue = values.map((date) => constrainValue(date, min, max))
      send({ type: "VALUE.SET", value: computedValue })
    },

    setFocusedValue(value: CalendarDate) {
      send({ type: "FOCUS.SET", value })
    },

    clearValue() {
      send("VALUE.CLEAR")
    },

    open() {
      send("OPEN")
    },

    /**
     * Function to close the calendar.
     */
    close() {
      send("CLOSE")
    },

    focusMonth(month: number) {
      const value = setMonth(focusedValue ?? getTodayDate(timeZone), month)
      send({ type: "FOCUS.SET", value })
    },

    focusYear(year: number) {
      const value = setYear(focusedValue ?? getTodayDate(timeZone), year)
      send({ type: "FOCUS.SET", value })
    },

    visibleRange: state.context.visibleRange,

    getYears() {
      return getDecadeRange(focusedValue.year).map((year) => ({ label: year.toString(), value: year }))
    },

    getYearsGrid(props: { columns?: number } = {}) {
      const { columns = 1 } = props
      return chunk(api.getYears(), columns)
    },

    getDecade() {
      const years = getDecadeRange(focusedValue.year)
      return { start: years.at(0), end: years.at(-1) }
    },

    getMonths(props: { format?: "short" | "long" } = {}) {
      const { format } = props
      return getMonthNames(locale, format).map((label, index) => ({ label, value: index + 1 }))
    },

    getMonthsGrid(props: { columns?: number; format?: "short" | "long" } = {}) {
      const { columns = 1, format } = props
      return chunk(api.getMonths({ format }), columns)
    },

    format(value: CalendarDate, opts: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" }) {
      return new DateFormatter(locale, opts).format(value.toDate(timeZone))
    },

    setView(view: DateView) {
      send({ type: "VIEW.SET", cell: view })
    },

    goToNext() {
      send({ type: "GOTO.NEXT", view: state.context.view })
    },

    goToPrev() {
      send({ type: "GOTO.PREV", view: state.context.view })
    },

    controlProps: normalize.element({
      ...parts.control.attrs,
      id: dom.getControlId(state.context),
      "data-disabled": dataAttr(disabled),
    }),

    contentProps: normalize.element({
      ...parts.content.attrs,
      hidden: !isOpen,
      "data-state": isOpen ? "open" : "closed",
      id: dom.getContentId(state.context),
      role: "application",
      "aria-roledescription": "datepicker",
      "aria-label": "calendar",
    }),

    getGridProps(props: GridProps = {}) {
      const { view = "day", columns = view === "day" ? 7 : 4, id } = props
      const uid = [view, id].filter(Boolean).join(" ")
      return normalize.element({
        ...parts.grid.attrs,
        role: "grid",
        "data-columns": columns,
        "aria-roledescription": getRoleDescription(view),
        id: dom.getGridId(state.context, uid),
        "aria-readonly": ariaAttr(readOnly),
        "aria-disabled": ariaAttr(disabled),
        "aria-multiselectable": ariaAttr(state.context.selectionMode !== "single"),
        "data-type": view,
        dir: state.context.dir,
        tabIndex: -1,
        onKeyDown(event) {
          const keyMap: EventKeyMap = {
            Enter() {
              // if focused date is unavailable, do nothing
              if (api.isUnavailable(focusedValue)) return
              send({ type: "GRID.ENTER", view, columns, focus: true })
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
        onPointerLeave() {
          send({ type: "GRID.POINTER_LEAVE" })
        },
        onPointerDown() {
          send({ type: "GRID.POINTER_DOWN", view })
        },
        onPointerUp() {
          send({ type: "GRID.POINTER_UP", view })
        },
      })
    },

    getDayCellState(props: DayCellProps) {
      const { value, disabled, offset = defaultOffset } = props
      const { visibleRange } = offset

      const formatter = getDayFormatter(locale, timeZone)
      const unitDuration = getUnitDuration(state.context.visibleDuration)
      const end = visibleRange.start.add(unitDuration).subtract({ days: 1 })

      const cellState = {
        isInvalid: isDateInvalid(value, min, max),
        isDisabled: disabled || isDateDisabled(value, visibleRange.start, end, min, max),
        isSelected: selectedValue.some((date) => isDateEqual(value, date)),
        isUnavailable: isDateUnavailable(value, isDateUnavailableFn, locale, min, max) && !disabled,
        isOutsideRange: isDateOutsideVisibleRange(value, visibleRange.start, end),
        isInRange:
          isRangePicker && (isDateWithinRange(value, selectedValue) || isDateWithinRange(value, hoveredRangeValue)),
        isFirstInRange: isRangePicker && isDateEqual(value, selectedValue[0]),
        isLastInRange: isRangePicker && isDateEqual(value, selectedValue[1]),
        isToday: isTodayDate(value, timeZone),
        isWeekend: isWeekend(value, locale),
        formattedDate: formatter.format(value.toDate(timeZone)),
        get isFocused() {
          return isDateEqual(value, focusedValue) && !cellState.isOutsideRange
        },
        get ariaLabel() {
          if (cellState.isUnavailable) return `Not available. ${cellState.formattedDate}`
          if (cellState.isSelected) return `Selected date. ${cellState.formattedDate}`
          return `Choose ${cellState.formattedDate}`
        },
        get isSelectable() {
          return !cellState.isDisabled && !cellState.isUnavailable
        },
      }

      return cellState
    },

    getDayCellProps(props: DayCellProps) {
      const { value } = props
      const cellState = api.getDayCellState(props)
      return normalize.element({
        role: "gridcell",
        "aria-disabled": ariaAttr(!cellState.isSelectable),
        "aria-selected": cellState.isSelected || cellState.isInRange,
        "aria-invalid": ariaAttr(cellState.isInvalid),
        "aria-current": cellState.isToday ? "date" : undefined,
        "data-value": value.toString(),
      })
    },

    getDayCellTriggerProps(props: DayCellProps) {
      const { value } = props
      const cellState = api.getDayCellState(props)
      return normalize.element({
        ...parts.cellTrigger.attrs,
        id: dom.getCellTriggerId(state.context, value.toString()),
        role: "button",
        tabIndex: cellState.isFocused ? 0 : -1,
        "aria-label": cellState.ariaLabel,
        "aria-disabled": ariaAttr(!cellState.isSelectable),
        "aria-invalid": ariaAttr(cellState.isInvalid),
        "data-disabled": dataAttr(!cellState.isSelectable),
        "data-selected": dataAttr(cellState.isSelected),
        "data-value": value.toString(),
        "data-type": "day",
        "data-today": dataAttr(cellState.isToday),
        "data-focused": dataAttr(cellState.isFocused),
        "data-unavailable": dataAttr(cellState.isUnavailable),
        "data-range-start": dataAttr(cellState.isFirstInRange),
        "data-range-end": dataAttr(cellState.isLastInRange),
        "data-in-range": dataAttr(cellState.isInRange),
        "data-outside-range": dataAttr(cellState.isOutsideRange),
        "data-weekend": dataAttr(cellState.isWeekend),
        onClick() {
          if (!cellState.isSelectable) return
          send({ type: "CELL.CLICK", cell: "day", value })
        },
        onPointerMove(event) {
          if (event.pointerType === "touch" || !cellState.isSelectable) return
          const focus = event.currentTarget.ownerDocument.activeElement !== event.currentTarget
          send({ type: "CELL.POINTER_MOVE", cell: "day", value, focus })
        },
        onContextMenu(event) {
          event.preventDefault()
        },
      })
    },

    getMonthCellState(props: CellProps) {
      const { value, disabled } = props
      const normalized = focusedValue.set({ month: value })
      const formatter = getMonthFormatter(locale, timeZone)
      const cellState = {
        isFocused: focusedValue.month === props.value,
        isSelectable: !isDateInvalid(normalized, min, max),
        isSelected: !!selectedValue.find((date) => date.month === value && date.year === focusedValue.year),
        valueText: formatter.format(normalized.toDate(timeZone)),
        get isDisabled() {
          return disabled || !cellState.isSelectable
        },
      }
      return cellState
    },

    getMonthCellProps(props: CellProps) {
      const { value } = props
      const cellState = api.getMonthCellState(props)
      return normalize.element({
        role: "gridcell",
        "aria-selected": ariaAttr(cellState.isSelected),
        "data-selected": dataAttr(cellState.isSelected),
        "aria-disabled": ariaAttr(!cellState.isSelectable),
        "data-value": value,
      })
    },

    getMonthCellTriggerProps(props: CellProps) {
      const { value } = props
      const cellState = api.getMonthCellState(props)
      return normalize.element({
        ...parts.cellTrigger.attrs,
        role: "button",
        id: dom.getCellTriggerId(state.context, value.toString()),
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

    getYearCellState(props: CellProps) {
      const { value, disabled } = props
      const normalized = focusedValue.set({ year: value })
      const cellState = {
        isFocused: focusedValue.year === props.value,
        isSelectable: !isDateInvalid(normalized, min, max),
        isSelected: !!selectedValue.find((date) => date.year === value),
        valueText: value.toString(),
        get isDisabled() {
          return disabled || !cellState.isSelectable
        },
      }
      return cellState
    },

    getYearCellProps(props: CellProps) {
      const { value } = props
      const cellState = api.getYearCellState(props)
      return normalize.element({
        role: "gridcell",
        "aria-selected": ariaAttr(cellState.isSelected),
        "data-selected": dataAttr(cellState.isSelected),
        "aria-disabled": ariaAttr(!cellState.isSelectable),
        "data-value": value,
      })
    },

    getYearCellTriggerProps(props: CellProps) {
      const { value } = props
      const cellState = api.getYearCellState(props)
      return normalize.element({
        ...parts.cellTrigger.attrs,
        role: "button",
        id: dom.getCellTriggerId(state.context, value.toString()),
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

    getNextTriggerProps(props: ViewProps = {}) {
      const { view = "day" } = props
      return normalize.button({
        ...parts.nextTrigger.attrs,
        id: dom.getNextTriggerId(state.context, view),
        type: "button",
        "aria-label": getPrevTriggerLabel(view),
        disabled: disabled || !state.context.isNextVisibleRangeValid,
        onClick() {
          send({ type: "GOTO.NEXT", view })
        },
      })
    },

    getPrevTriggerProps(props: ViewProps = {}) {
      const { view = "day" } = props
      return normalize.button({
        ...parts.prevTrigger.attrs,
        id: dom.getPrevTriggerId(state.context, view),
        type: "button",
        "aria-label": getNextTriggerLabel(view),
        disabled: disabled || !state.context.isPrevVisibleRangeValid,
        onClick() {
          send({ type: "GOTO.PREV", view })
        },
      })
    },

    getHeaderProps(props: ViewProps = {}) {
      const { view = "day" } = props
      return normalize.element({
        ...parts.rowHeader.attrs,
        "aria-hidden": true,
        dir: state.context.dir,
        "data-type": view,
        "data-disabled": dataAttr(disabled),
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
      "data-state": isOpen ? "open" : "closed",
      "aria-haspopup": "grid",
      disabled,
      onClick() {
        if (!isInteractive) return
        send("TRIGGER.CLICK")
      },
    }),

    getViewTriggerProps(props: ViewProps = {}) {
      const { view = "day" } = props
      return normalize.button({
        ...parts.viewTrigger.attrs,
        id: dom.getViewTriggerId(state.context, view),
        type: "button",
        disabled,
        "aria-label": getViewTriggerLabel(state.context.view),
        onClick() {
          if (!isInteractive) return
          send("VIEW.CHANGE")
        },
      })
    },

    inputProps: normalize.input({
      ...parts.input.attrs,
      id: dom.getInputId(state.context),
      autoComplete: "off",
      autoCorrect: "off",
      spellCheck: "false",
      dir: state.context.dir,
      name: state.context.name,
      "data-state": isOpen ? "open" : "closed",
      readOnly,
      disabled,
      placeholder: getInputPlaceholder(locale),
      defaultValue: state.context.inputValue,
      onBeforeInput(event) {
        const { data } = getNativeEvent(event)
        if (!isValidCharacter(data, separator)) {
          event.preventDefault()
        }
      },
      onFocus() {
        send("INPUT.FOCUS")
      },
      onBlur(event) {
        send({ type: "INPUT.BLUR", value: event.currentTarget.value })
      },
      onKeyDown(event) {
        if (event.key !== "Enter" || !isInteractive) return
        if (api.isUnavailable(state.context.focusedValue)) return
        send({ type: "INPUT.ENTER", value: event.currentTarget.value })
      },
      onChange(event) {
        const { value } = event.target
        send({ type: "INPUT.CHANGE", value: ensureValidCharacters(value, separator) })
      },
    }),

    monthSelectProps: normalize.select({
      ...parts.monthSelect.attrs,
      id: dom.getMonthSelectId(state.context),
      "aria-label": "Select month",
      disabled,
      dir: state.context.dir,
      defaultValue: focusedValue.month,
      onChange(event) {
        api.focusMonth(Number(event.currentTarget.value))
      },
    }),

    yearSelectProps: normalize.select({
      ...parts.yearSelect.attrs,
      id: dom.getYearSelectId(state.context),
      disabled,
      "aria-label": "Select year",
      dir: state.context.dir,
      defaultValue: focusedValue.year,
      onChange(event) {
        api.focusYear(Number(event.currentTarget.value))
      },
    }),

    positionerProps: normalize.element({
      id: dom.getPositionerId(state.context),
      ...parts.positioner.attrs,
      style: popperStyles.floating,
    }),
  }

  return api
}
