import { StateMachine as S } from "@ui-machines/core"
import { dataAttr, EventKeyMap, getEventKey, getEventStep } from "@ui-machines/dom-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { dom } from "./splitter.dom"
import { MachineContext, MachineState } from "./splitter.types"

export function connect<T extends PropTypes = ReactPropTypes>(
  state: S.State<MachineContext, MachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = normalizeProp,
) {
  const isFocused = state.hasTag("focus")
  const isDragging = state.matches("dragging")

  return {
    isCollapsed: state.context.isAtMin,
    isExpanded: state.context.isAtMax,
    isFocused,
    isDragging,

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

    rootProps: normalize.element<T>({
      "data-part": "root",
      "data-orientation": state.context.orientation,
      "data-disabled": state.context.disabled,
      id: dom.getRootId(state.context),
      style: {
        display: "flex",
        flex: "1 1 0%",
        height: state.context.isHorizontal ? "100%" : "auto",
        width: state.context.isHorizontal ? "auto" : "100%",
        flexDirection: state.context.isHorizontal ? "row" : "column",
      },
    }),

    secondaryPaneProps: normalize.element<T>({
      "data-part": "secondary-pane",
      "data-disabled": state.context.disabled,
      id: dom.getSecondaryPaneId(state.context),
      style: {
        height: state.context.isHorizontal ? "100%" : "auto",
        width: state.context.isHorizontal ? "auto" : "100%",
        flex: "1 1 auto",
        position: "relative",
      },
    }),

    primaryPaneProps: normalize.element<T>({
      "data-part": "primary-pane",
      id: dom.getPrimaryPaneId(state.context),
      "data-disabled": state.context.disabled,
      "data-state": state.context.isAtMax ? "at-max" : state.context.isAtMin ? "at-min" : "between",
      style: {
        minWidth: `${state.context.min}px`,
        maxWidth: `${state.context.max}px`,
        visibility: "visible",
        flex: `0 0 ${state.context.value}px`,
        position: "relative",
        userSelect: state.matches("dragging") ? "none" : "auto",
      },
    }),

    toggleButtonProps: normalize.element<T>({
      "data-part": "toggle-button",
      id: dom.getToggleButtonId(state.context),
      "aria-label": state.context.isAtMin ? "Expand Primary Pane" : "Collapse Primary Pane",
      onClick() {
        send("TOGGLE")
      },
    }),

    labelProps: normalize.element<T>({
      "data-part": "label",
      id: dom.getSplitterLabelId(state.context),
    }),

    splitterProps: normalize.element<T>({
      "data-part": "splitter",
      id: dom.getSplitterId(state.context),
      role: "separator",
      tabIndex: state.context.disabled ? -1 : 0,
      "aria-valuenow": state.context.value,
      "aria-valuemin": state.context.min,
      "aria-valuemax": state.context.max,
      "aria-orientation": state.context.orientation,
      "aria-labelledby": dom.getSplitterLabelId(state.context),
      "aria-controls": dom.getPrimaryPaneId(state.context),
      "data-orientation": state.context.orientation,
      "data-focus": dataAttr(isFocused),
      "data-disabled": dataAttr(state.context.disabled),
      style: {
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        msUserSelect: "none",
        flex: "0 0 auto",
        cursor: dom.getCursor(state.context),
        minHeight: state.context.isHorizontal ? "0px" : undefined,
        minWidth: state.context.isHorizontal ? undefined : "0px",
      },
      onPointerDown(event) {
        if (state.context.disabled) {
          event.preventDefault()
          return
        }
        send("POINTER_DOWN")
        event.preventDefault()
        event.stopPropagation()
      },
      onPointerOver() {
        if (state.context.disabled) return
        send("POINTER_OVER")
      },
      onPointerLeave() {
        if (state.context.disabled) return
        send("POINTER_LEAVE")
      },
      onBlur() {
        send("BLUR")
      },
      onFocus() {
        send("FOCUS")
      },
      onDoubleClick() {
        if (state.context.disabled) return
        send("DOUBLE_CLICK")
      },
      onKeyDown(event) {
        if (state.context.disabled) return
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
          event.stopPropagation()
        }
      },
    }),
  }
}
