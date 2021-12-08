import { dataAttr, EventKeyMap, getEventKey, getEventStep, getNativeEvent } from "@ui-machines/dom-utils"
import { multiply, percentToValue, toRanges, valueToPercent } from "@ui-machines/number-utils"
import { getEventPoint } from "@ui-machines/rect-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { isLeftClick, isModifiedEvent } from "@ui-machines/utils"
import { dom, getRangeAtIndex } from "./range-slider.dom"
import { Send, State } from "./range-slider.types"

export function connect<T extends PropTypes = ReactPropTypes>(state: State, send: Send, normalize = normalizeProp) {
  const { context: ctx } = state
  const { value: values, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy } = ctx

  const isFocused = state.matches("focus")
  const isDragging = state.matches("dragging")

  return {
    // state
    values: ctx.value,
    isDragging,
    isFocused,

    // methods
    setValue(values: number[]) {
      send({ type: "SET_VALUE", value: values })
    },
    getThumbValue(index: number) {
      return values[index]
    },
    setThumbValue(index: number, value: number) {
      send({ type: "SET_VALUE", index, value })
    },
    getThumbPercent(index: number) {
      return valueToPercent(values[index], ctx)
    },
    setThumbPercent(index: number, percent: number) {
      const value = percentToValue(percent, ctx)
      send({ type: "SET_VALUE", index, value })
    },
    getPercentValue(percent: number) {
      return percentToValue(percent, ctx)
    },
    getThumbMin(index: number) {
      return getRangeAtIndex(ctx, index).min
    },
    getThumbMax(index: number) {
      return getRangeAtIndex(ctx, index).max
    },
    increment(index: number) {
      send({ type: "INCREMENT", index })
    },
    decrement(index: number) {
      send({ type: "DECREMENT", index })
    },
    focus(index = 0) {
      send({ type: "FOCUS", index })
    },
    blur() {
      send({ type: "BLUR" })
    },

    // dom attributes
    labelProps: normalize.label<T>({
      "data-part": "label",
      id: dom.getLabelId(ctx),
      htmlFor: dom.getInputId(ctx, 0),
      onClick(event) {
        event.preventDefault()
        dom.getFirstEl(ctx)?.focus()
      },
      style: {
        userSelect: "none",
      },
    }),

    outputProps: normalize.output<T>({
      "data-part": "output",
      id: dom.getOutputId(ctx),
      htmlFor: values.map((v, i) => dom.getInputId(ctx, i)).join(" "),
      "aria-live": "off",
    }),

    trackProps: normalize.element<T>({
      "data-part": "track",
      id: dom.getTrackId(ctx),
      "data-disabled": dataAttr(ctx.disabled),
      "data-orientation": ctx.orientation,
      "data-focus": dataAttr(isFocused),
      style: dom.getTrackStyle(),
    }),

    getThumbProps(index: number) {
      const value = values[index]
      const spacing = multiply(ctx.minStepsBetweenThumbs, ctx.step)
      const range = toRanges({ ...ctx, spacing })[index]

      const ariaValueText = ctx.getAriaValueText?.(value, index)
      const _ariaLabel = Array.isArray(ariaLabel) ? ariaLabel[index] : ariaLabel
      const _ariaLabelledBy = Array.isArray(ariaLabelledBy) ? ariaLabelledBy[index] : ariaLabelledBy

      return normalize.element<T>({
        "data-part": "thumb",
        "data-index": index,
        id: dom.getThumbId(ctx, index),
        "data-disabled": dataAttr(ctx.disabled),
        "data-orientation": ctx.orientation,
        "data-focus": dataAttr(isFocused),
        draggable: false,
        "aria-disabled": ctx.disabled || undefined,
        "aria-label": _ariaLabel,
        "aria-labelledby": _ariaLabelledBy ?? dom.getLabelId(ctx),
        "aria-orientation": ctx.orientation,
        "aria-valuemax": range.max,
        "aria-valuemin": range.min,
        "aria-valuenow": values[index],
        "aria-valuetext": ariaValueText,
        role: "slider",
        tabIndex: ctx.disabled ? -1 : 0,
        style: dom.getThumbStyle(ctx, index),
        onBlur() {
          send("BLUR")
        },
        onFocus() {
          send({ type: "FOCUS", index })
        },
        onKeyDown(event) {
          const step = multiply(getEventStep(event), ctx.step)
          let prevent = true
          const keyMap: EventKeyMap = {
            ArrowUp() {
              send({ type: "ARROW_UP", step })
              prevent = ctx.isVertical
            },
            ArrowDown() {
              send({ type: "ARROW_DOWN", step })
              prevent = ctx.isVertical
            },
            ArrowLeft() {
              send({ type: "ARROW_LEFT", step })
              prevent = ctx.isHorizontal
            },
            ArrowRight() {
              send({ type: "ARROW_RIGHT", step })
              prevent = ctx.isHorizontal
            },
            PageUp() {
              send({ type: "PAGE_UP", step })
            },
            PageDown() {
              send({ type: "PAGE_DOWN", step })
            },
            Home() {
              send("HOME")
            },
            End() {
              send("END")
            },
          }

          const key = getEventKey(event, ctx)
          const exec = keyMap[key]

          if (!exec) return
          exec(event)

          if (prevent) {
            event.preventDefault()
            event.stopPropagation()
          }
        },
      })
    },

    getInputProps(index: number) {
      return normalize.input<T>({
        "data-part": "input",
        name: ctx.name?.[index],
        type: "hidden",
        value: ctx.value[index],
        id: dom.getInputId(ctx, index),
      })
    },

    rangeProps: normalize.element<T>({
      "data-part": "range",
      "data-disabled": dataAttr(ctx.disabled),
      "data-orientation": ctx.orientation,
      "data-state": state.value,
      style: dom.getRangeStyle(ctx),
    }),

    rootProps: normalize.element<T>({
      "data-part": "root",
      id: dom.getRootId(ctx),
      "data-disabled": dataAttr(ctx.disabled),
      "data-orientation": ctx.orientation,
      "data-focus": dataAttr(isFocused),
      style: dom.getRootStyle(ctx),
      onPointerDown(event) {
        const evt = getNativeEvent(event)
        if (!isLeftClick(evt) || isModifiedEvent(evt)) return

        event.preventDefault()
        event.stopPropagation()

        send({
          type: "POINTER_DOWN",
          point: getEventPoint(evt),
        })
      },
    }),
  }
}
