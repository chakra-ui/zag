import { NormalizeProps, type PropTypes } from "@zag-js/types"
import { CellProps, Send, State } from "./date-picker.types"
import { getCalendarState } from "@zag-js/date-utils"
import { ariaAttr, dataAttr, EventKeyMap, getEventKey } from "@zag-js/dom-utils"
import { parts } from "./date-picker.anatomy"
import { dom } from "./date-picker.dom"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const calendar = getCalendarState(state.context)

  const startDate = state.context.startValue
  const endDate = state.context.endValue
  const selectedDate = state.context.value
  const focusedDate = state.context.focusedValue

  const disabled = state.context.disabled
  const readonly = state.context.readonly

  const formatDay = (day: Date) => {
    return state.context.dayFormatter.format(day)
  }

  return {
    weeks: state.context.weeks,
    weekDays: calendar.getWeekDays().map(formatDay),
    visibleRangeText: "TODO",

    value: selectedDate,
    valueAsDate: selectedDate?.toDate(state.context.timeZone),
    valueAsString: selectedDate?.toString(),

    focusedValue: focusedDate,
    focusedValueAsDate: focusedDate?.toDate(state.context.timeZone),
    focusedValueAsString: focusedDate?.toString(),

    setMonth(month: number) {
      if (!selectedDate) return
      const date = calendar.setMonth(selectedDate, month)
      send({ type: "SET_VALUE", date })
    },
    setYear(year: number) {
      if (!selectedDate) return
      const date = calendar.setYear(selectedDate, year)
      send({ type: "SET_VALUE", date })
    },

    rootProps: normalize.element({
      role: "group",
      "aria-label": "TODO",
      ...parts.root.attrs,
      id: dom.getRootId(state.context),
    }),

    controlProps: normalize.element({
      ...parts.control.attrs,
      id: dom.getControlId(state.context),
    }),

    gridProps: normalize.element({
      ...parts.grid.attrs,
      role: "grid",
      id: dom.getGridId(state.context),
      "aria-readonly": readonly || undefined,
      "aria-disabled": disabled || undefined,
      tabIndex: -1,
      onKeyDown(event) {
        const keyMap: EventKeyMap = {
          Enter() {
            send("ENTER")
          },
          ArrowLeft() {
            send("ARROW_LEFT")
          },
          ArrowRight() {
            send("ARROW_RIGHT")
          },
          ArrowUp() {
            send("ARROW_UP")
          },
          ArrowDown() {
            send("ARROW_DOWN")
          },
          PageUp(event) {
            send({ type: "PAGE_UP", larger: event.shiftKey })
          },
          PageDown(event) {
            send({ type: "PAGE_DOWN", larger: event.shiftKey })
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
        send({ type: "POINTER_DOWN" })
      },
      onPointerUp() {
        send({ type: "POINTER_UP" })
      },
    }),

    getCellState(props: CellProps) {
      const { date, disabled } = props
      return {
        isInvalid: calendar.isInvalid(date),
        isDisabled: calendar.isDisabled(date, startDate, endDate),
        isSelected: calendar.isEqual(date, selectedDate),
        isUnavailable: calendar.isUnavailable(date) && !disabled,
        isOutsideRange: calendar.isOutsideVisibleRange(date, startDate, endDate),
        isFocused: calendar.isEqual(date, focusedDate),
        isToday: calendar.isToday(date),
        get isSelectable() {
          return !this.isDisabled && !this.isUnavailable
        },
      }
    },

    getCellProps(props: CellProps) {
      const cellState = this.getCellState(props)
      return normalize.element({
        ...parts.cell.attrs,
        role: "gridcell",
        id: dom.getCellId(state.context, props.date.toString()),
        "aria-disabled": !cellState.isSelectable || undefined,
        "aria-selected": cellState.isSelected || undefined,
        "aria-invalid": cellState.isInvalid || undefined,
      })
    },

    getCellTriggerProps(props: CellProps) {
      const cellState = this.getCellState(props)
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
          send({ type: "FOCUS_CELL", date: props.date })
        },
        onPointerUp() {
          send({ type: "CLICK_CELL", date: props.date })
        },
      })
    },

    nextTriggerProps: normalize.button({
      ...parts.nextTrigger.attrs,
      id: dom.getNextTriggerId(state.context),
      type: "button",
      onClick() {
        send("CLICK_NEXT")
      },
      "aria-label": "TODO",
      disabled: state.context.isNextVisibleRangeValid,
    }),

    prevTriggerProps: normalize.button({
      ...parts.prevTrigger.attrs,
      id: dom.getPrevTriggerId(state.context),
      type: "button",
      onClick() {
        send("CLICK_PREV")
      },
      "aria-label": "TODO",
      disabled: state.context.isPrevVisibleRangeValid,
    }),
  }
}
