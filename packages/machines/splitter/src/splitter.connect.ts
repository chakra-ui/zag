import { dataAttr, EventKeyMap, getEventKey, getEventStep } from "@zag-js/dom-utils"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./splitter.anatomy"
import { dom } from "./splitter.dom"
import type { Send, State } from "./splitter.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isHorizontal = state.context.isHorizontal
  const isDisabled = state.context.disabled

  const isFocused = state.hasTag("focus")
  const isDragging = state.matches("dragging")

  const isAtMin = state.context.isAtMin
  const isAtMax = state.context.isAtMax
  const min = state.context.min
  const max = state.context.max
  const value = state.context.value

  return {
    isCollapsed: isAtMin,
    isExpanded: isAtMax,
    isFocused,
    isDragging,
    value,

    collapse() {
      send("COLLAPSE")
    },
    expand() {
      send("EXPAND")
    },
    toggle() {
      send("TOGGLE")
    },
    setSize(size: number) {
      send({ type: "SET_SIZE", size })
    },

    rootProps: normalize.element({
      ...parts.root.attrs,
      "data-orientation": state.context.orientation,
      "data-disabled": dataAttr(isDisabled),
      id: dom.getRootId(state.context),
      style: {
        display: "flex",
        flex: "1 1 0%",
        flexDirection: isHorizontal ? "row" : "column",
      },
    }),

    secondaryPaneProps: normalize.element({
      ...parts.secondaryPane.attrs,
      "data-disabled": dataAttr(isDisabled),
      id: dom.getSecondaryPaneId(state.context),
      style: {
        height: isHorizontal ? "100%" : "auto",
        width: isHorizontal ? "auto" : "100%",
        flex: "1 1 auto",
        position: "relative",
      },
    }),

    primaryPaneProps: normalize.element({
      ...parts.primaryPane.attrs,
      id: dom.getPrimaryPaneId(state.context),
      "data-disabled": dataAttr(isDisabled),
      "data-state": isAtMax ? "at-max" : isAtMin ? "at-min" : "between",
      style: {
        visibility: "visible",
        flex: `0 0 ${value}px`,
        position: "relative",
        userSelect: isDragging ? "none" : "auto",
        ...(isHorizontal
          ? { minWidth: `${min}px`, maxWidth: `${max}px` }
          : { minHeight: `${min}px`, maxHeight: `${max}px` }),
      },
    }),

    toggleButtonProps: normalize.element({
      ...parts.toggleButton.attrs,
      id: dom.getToggleButtonId(state.context),
      "aria-label": state.context.isAtMin ? "Expand Primary Pane" : "Collapse Primary Pane",
      onClick() {
        send("TOGGLE")
      },
    }),

    labelProps: normalize.element({
      ...parts.label.attrs,
      id: dom.getLabelId(state.context),
    }),

    splitterProps: normalize.element({
      ...parts.splitter.attrs,
      id: dom.getSplitterId(state.context),
      role: "separator",
      tabIndex: isDisabled ? undefined : 0,
      "aria-valuenow": value,
      "aria-valuemin": min,
      "aria-valuemax": max,
      "aria-orientation": state.context.orientation,
      "aria-labelledby": dom.getLabelId(state.context),
      "aria-controls": dom.getPrimaryPaneId(state.context),
      "data-orientation": state.context.orientation,
      "data-focus": dataAttr(isFocused),
      "data-disabled": dataAttr(isDisabled),
      style: {
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        msUserSelect: "none",
        flex: "0 0 auto",
        cursor: dom.getCursor(state.context),
        minHeight: isHorizontal ? "0px" : undefined,
        minWidth: isHorizontal ? undefined : "0px",
      },
      onPointerDown(event) {
        if (isDisabled) {
          event.preventDefault()
          return
        }
        send("POINTER_DOWN")
        event.preventDefault()
        event.stopPropagation()
      },
      onPointerOver() {
        if (isDisabled) return
        send("POINTER_OVER")
      },
      onPointerLeave() {
        if (isDisabled) return
        send("POINTER_LEAVE")
      },
      onBlur() {
        send("BLUR")
      },
      onFocus() {
        send("FOCUS")
      },
      onDoubleClick() {
        if (isDisabled) return
        send("DOUBLE_CLICK")
      },
      onKeyDown(event) {
        if (isDisabled) return
        const step = getEventStep(event) * state.context.step
        const keyMap: EventKeyMap = {
          ArrowUp() {
            send({ type: "ARROW_UP", step })
          },
          ArrowDown() {
            send({ type: "ARROW_DOWN", step })
          },
          ArrowLeft() {
            send({ type: "ARROW_LEFT", step })
          },
          ArrowRight() {
            send({ type: "ARROW_RIGHT", step })
          },
          Home() {
            send("HOME")
          },
          End() {
            send("END")
          },
        }

        const key = getEventKey(event, state.context)
        const exec = keyMap[key]

        if (exec) {
          exec(event)
          event.preventDefault()
        }
      },
    }),
  }
}
