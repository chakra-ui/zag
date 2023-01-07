import {
  DateSegmentDetails,
  getSegments,
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
import { ariaAttr, dataAttr, EventKeyMap, getEventKey, isModifiedEvent } from "@zag-js/dom-utils"
import { NormalizeProps, type PropTypes } from "@zag-js/types"
import { parts } from "./date-picker.anatomy"
import { dom } from "./date-picker.dom"
import { CellProps, Send, State } from "./date-picker.types"

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

  return {
    weeks: state.context.weeks,
    weekDays: getWeekDates(getTodayDate(timeZone), timeZone, locale).map((day: Date) =>
      state.context.dayFormatter.format(day),
    ),
    visibleRangeText: "TODO",
    segments: getSegments(
      state.context.displayValue,
      state.context.validSegments,
      state.context.getDateFormatter({ day: "2-digit", month: "2-digit", year: "numeric", timeZone }),
      timeZone,
    ),

    value: selectedDate,
    valueAsDate: selectedDate?.toDate(timeZone),
    valueAsString: selectedDate?.toString(),

    focusedValue: focusedDate,
    focusedValueAsDate: focusedDate?.toDate(timeZone),
    focusedValueAsString: focusedDate?.toString(),

    setMonth(month: number) {
      if (!selectedDate) return
      const date = setMonth(selectedDate, month)
      send({ type: "SET_VALUE", date })
    },
    setYear(year: number) {
      if (!selectedDate) return
      const date = setYear(selectedDate, year)
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
      "data-focus": dataAttr(!!state.context.focusedSegment),
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
        isInvalid: isDateInvalid(date, min, max),
        isDisabled: isDateDisabled(date, startDate, endDate, min, max),
        isSelected: isDateEqual(date, selectedDate),
        isUnavailable: isDateUnavailable(date, state.context.isDateUnavailable, min, max) && !disabled,
        isOutsideRange: isDateOutsideVisibleRange(date, startDate, endDate),
        isFocused: isDateEqual(date, focusedDate),
        isToday: isTodayDate(date, timeZone),
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

    triggerProps: normalize.button({
      ...parts.trigger.attrs,
      id: dom.getTriggerId(state.context),
      type: "button",
      onClick() {
        send("CLICK_TRIGGER")
      },
    }),

    fieldProps: normalize.element({
      ...parts.field.attrs,
      role: "presentation",
      id: dom.getFieldId(state.context),
    }),

    groupProps: normalize.element({
      ...parts.group.attrs,
      id: dom.getGroupId(state.context),
      onKeyDown(event) {
        const keyMap: EventKeyMap = {
          ArrowLeft() {
            send("ARROW_LEFT")
          },
          ArrowRight() {
            send("ARROW_RIGHT")
          },
        }

        const exec = keyMap[getEventKey(event, state.context)]

        if (exec) {
          exec(event)
          event.preventDefault()
        }
      },
    }),

    getSegmentProps(props: DateSegmentDetails) {
      if (props.type === "literal") {
        return {
          "data-scope": "date-picker",
          "data-literal": "",
          id: dom.getSegmentId(state.context, props.type),
          "aria-hidden": true,
        }
      }

      const isEditable = state.context.isInteractive && props.isEditable
      return normalize.element({
        ...parts.segment.attrs,
        id: dom.getSegmentId(state.context, props.type),
        role: "spinbutton",
        "aria-valuemax": props.max,
        "aria-valuemin": props.min,
        "aria-valuenow": props.value,
        "aria-valuetext": "TODO",
        ["enterKeyHint" as any]: isEditable ? "next" : undefined,
        "aria-readonly": state.context.readonly || !props.isEditable ? "true" : undefined,
        "data-placeholder": props.isPlaceholder || undefined,
        "data-editable": dataAttr(isEditable),
        contentEditable: isEditable,
        suppressContentEditableWarning: isEditable,
        spellCheck: isEditable ? "false" : undefined,
        autoCapitalize: isEditable ? "off" : undefined,
        autoCorrect: isEditable ? "off" : undefined,
        inputMode:
          disabled || props.type === "dayPeriod" || props.type === "era" || !isEditable ? undefined : "numeric",
        tabIndex: disabled ? undefined : 0,
        style: {
          "--min-width": props.max != null ? String(props.max).length + "ch" : undefined,
          caretColor: "transparent",
          fontVariantNumeric: "tabular-nums",
        },
        onFocus() {
          send({ type: "FOCUS_SEGMENT", segment: props.type })
        },
        onKeyDown(event) {
          if (isModifiedEvent(event) || readonly) return

          const keyMap: EventKeyMap = {
            ArrowUp() {
              send("ARROW_UP")
            },
            ArrowDown() {
              send("ARROW_DOWN")
            },
            PageUp() {},
            PageDown() {},
            Home() {},
            End() {},
          }

          const exec = keyMap[getEventKey(event, state.context)]

          if (exec) {
            exec(event)
            event.preventDefault()
            event.stopPropagation()
          }
        },
      })
    },
  }
}
