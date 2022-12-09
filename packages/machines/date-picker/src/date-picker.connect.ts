import { NormalizeProps, type PropTypes } from "@zag-js/types"
import { State, Send, CellProps } from "./date-picker.types"
// import { dom } from "./date-picker.dom"
import { getCalendarState } from "@zag-js/date-utils"
import { ariaAttr, dataAttr, EventKeyMap, getEventKey } from "@zag-js/dom-utils"
import { parts } from "./date-picker.anatomy"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const calendar = getCalendarState(state.context)

  const startDate = state.context.startValue
  const endDate = state.context.endValue
  const selectedDate = state.context.value
  const focusedDate = state.context.focusedValue

  const disabled = state.context.disabled
  const readonly = state.context.readonly

  return {
    value: selectedDate,
    valueAsDate: selectedDate?.toDate(state.context.timeZone),
    valueAsString: selectedDate?.toString(),

    rootProps: normalize.element({
      ...parts.root.attrs,
    }),

    gridProps: normalize.element({
      ...parts.grid.attrs,
      role: "grid",
      "aria-readonly": readonly || undefined,
      "aria-disabled": disabled || undefined,
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
        "aria-disabled": !cellState.isSelectable || undefined,
        "aria-selected": cellState.isSelected || undefined,
        "aria-invalid": cellState.isInvalid || undefined,
      })
    },

    getCellTriggerProps(props: CellProps) {
      const cellState = this.getCellState(props)
      return normalize.element({
        ...parts.cellTrigger.attrs,
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
      type: "button",
      onClick() {
        send("CLICK_NEXT")
      },
      "aria-label": "TODO",
      disabled: state.context.isNextVisibleRangeValid,
      // onFocus: () => (nextFocused.current = true),
      // onBlur: () => (nextFocused.current = false)
    }),

    prevTriggerProps: normalize.button({
      ...parts.prevTrigger.attrs,
      type: "button",
      onClick() {
        send("CLICK_PREV")
      },
      "aria-label": "TODO",
      disabled: state.context.isPrevVisibleRangeValid,
      // onFocus: () => (previousFocused.current = true),
      // onBlur: () => (previousFocused.current = false)
    }),
  }
}
