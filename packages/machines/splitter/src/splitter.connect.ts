import { dataAttr, EventKeyMap, getEventKey, getEventStep } from "@zag-js/dom-utils"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { dom } from "./splitter.dom"
import type { PaneProps, Send, SeparatorProps, State } from "./splitter.types"
import { utils } from "./splitter.utils"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isHorizontal = state.context.isHorizontal

  const isFocused = state.hasTag("focus")
  const isDragging = state.matches("dragging")

  const values = state.context.values

  const getIndexAttrs = (index: number) => {
    const attrs = {
      min: utils.getValueAtIndex(state.context.min, index),
      max: utils.getValueAtIndex(state.context.max, index),
      step: utils.getValueAtIndex(state.context.step, index),
      value: utils.getValueAtIndex(state.context.values, index),
    }

    return attrs
  }

  return {
    isFocused,
    isDragging,
    values,

    resize(index: number, size: number) {
      send({ type: "SET_SIZE", index, size })
    },
    collapse(index: number) {
      send({ type: "COLLAPSE", index })
    },
    expand(index: number) {
      send({ type: "EXPAND", index })
    },
    toggle(index: number) {
      send({ type: "TOGGLE", index })
    },
    reset() {
      send("RESET")
    },

    rootProps: normalize.element({
      "data-part": "root",
      "data-orientation": state.context.orientation,
      id: dom.getRootId(state.context),
      style: {
        display: "flex",
        flex: "1 1 0%",
        flexDirection: isHorizontal ? "row" : "column",
      },
    }),

    getPaneProps(options: PaneProps) {
      const { min, max, step: _step, value } = getIndexAttrs(options.index)

      return normalize.element({
        "data-part": "pane",
        id: dom.getPaneId(state.context, options.index),

        style: {
          visibility: "visible",
          position: "relative",
          userSelect: isDragging ? "none" : "auto",
          flex: typeof value === "undefined" ? "1 1 auto" : `0 0 ${value}px`,
          ...(isHorizontal
            ? { minWidth: `${min}px`, maxWidth: `${max}px` }
            : { minHeight: `${min}px`, maxHeight: `${max}px` }),
        },
      })
    },

    getSeparatorProps(options: SeparatorProps) {
      const { min, max, step: _step, value } = getIndexAttrs(options.index)
      return normalize.element({
        "data-part": "splitter",
        id: dom.getSeparatorId(state.context, options.index),
        role: "separator",
        tabIndex: 0,
        "aria-valuenow": value,
        "aria-valuemin": min,
        "aria-valuemax": max,
        "aria-orientation": state.context.orientation,
        "data-orientation": state.context.orientation,
        "data-focus": dataAttr(state.context.focusedSeparator === options.index),
        style: {
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
          msUserSelect: "none",
          flex: "0 0 auto",
          cursor: dom.getCursor(state.context, options.index),
          minHeight: isHorizontal ? "0px" : undefined,
          minWidth: isHorizontal ? undefined : "0px",
        },
        onPointerDown(event) {
          send({ type: "POINTER_DOWN", ...options })
          event.preventDefault()
          event.stopPropagation()
        },
        onPointerOver() {
          send({ type: "POINTER_OVER", ...options })
        },
        onPointerLeave() {
          send({ type: "POINTER_LEAVE", ...options })
        },
        onBlur() {
          send({ type: "BLUR", ...options })
        },
        onFocus() {
          send({ type: "FOCUS", ...options })
        },
        onDoubleClick() {
          send({ type: "DOUBLE_CLICK", ...options })
        },
        onKeyDown(event) {
          const step = getEventStep(event) * _step
          const keyMap: EventKeyMap = {
            ArrowUp() {
              send({ type: "ARROW_UP", step, ...options })
            },
            ArrowDown() {
              send({ type: "ARROW_DOWN", step, ...options })
            },
            ArrowLeft() {
              send({ type: "ARROW_LEFT", step, ...options })
            },
            ArrowRight() {
              send({ type: "ARROW_RIGHT", step, ...options })
            },
            Home() {
              send({ type: "HOME", ...options })
            },
            End() {
              send({ type: "END", ...options })
            },
          }

          const key = getEventKey(event, state.context)
          const exec = keyMap[key]

          if (exec) {
            exec(event)
            event.preventDefault()
          }
        },
      })
    },
  }
}
