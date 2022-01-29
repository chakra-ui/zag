import { StateMachine as S } from "@ui-machines/core"
import { dataAttr, EventKeyMap, getEventKey, getEventStep } from "@ui-machines/dom-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { dom } from "./split-view.dom"
import { MachineContext, MachineState } from "./split-view.types"

export function connect<T extends PropTypes = ReactPropTypes>(
  state: S.State<MachineContext, MachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = normalizeProp,
) {
  const { context: ctx } = state

  const isFocused = state.matches("hover", "dragging", "focused")
  const isDragging = state.matches("dragging")

  return {
    isCollapsed: ctx.isAtMin,
    isExpanded: ctx.isAtMax,
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
      "data-orientation": ctx.orientation,
      "data-disabled": ctx.disabled,
      id: dom.getRootId(ctx),
      style: {
        display: "flex",
        flex: "1 1 0%",
        height: ctx.isHorizontal ? "100%" : "auto",
        width: ctx.isHorizontal ? "auto" : "100%",
        flexDirection: ctx.isHorizontal ? "row" : "column",
      },
    }),

    secondaryPaneProps: normalize.element<T>({
      "data-part": "secondary-pane",
      "data-disabled": ctx.disabled,
      id: dom.getSecondaryPaneId(ctx),
      style: {
        height: ctx.isHorizontal ? "100%" : "auto",
        width: ctx.isHorizontal ? "auto" : "100%",
        flex: "1 1 auto",
        position: "relative",
      },
    }),

    primaryPaneProps: normalize.element<T>({
      "data-part": "primary-pane",
      id: dom.getPrimaryPaneId(ctx),
      "data-disabled": ctx.disabled,
      "data-state": ctx.isAtMax ? "at-max" : ctx.isAtMin ? "at-min" : "between",
      style: {
        minWidth: `${ctx.min}px`,
        maxWidth: `${ctx.max}px`,
        visibility: "visible",
        flex: `0 0 ${ctx.value}px`,
        position: "relative",
        userSelect: state.matches("dragging") ? "none" : "auto",
      },
    }),

    toggleButtonProps: normalize.element<T>({
      "data-part": "toggle-button",
      id: dom.getToggleButtonId(ctx),
      "aria-label": ctx.isAtMin ? "Expand Primary Pane" : "Collapse Primary Pane",
      onClick() {
        send("TOGGLE")
      },
    }),

    labelProps: normalize.element<T>({
      "data-part": "label",
      id: dom.getSplitterLabelId(ctx),
    }),

    splitterProps: normalize.element<T>({
      "data-part": "splitter",
      id: dom.getSplitterId(ctx),
      role: "separator",
      tabIndex: ctx.disabled ? -1 : 0,
      "aria-valuenow": ctx.value,
      "aria-valuemin": ctx.min,
      "aria-valuemax": ctx.max,
      "aria-orientation": ctx.orientation,
      "aria-labelledby": dom.getSplitterLabelId(ctx),
      "aria-controls": dom.getPrimaryPaneId(ctx),
      "data-orientation": ctx.orientation,
      "data-focus": dataAttr(isFocused),
      "data-disabled": dataAttr(ctx.disabled),
      style: {
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        msUserSelect: "none",
        flex: "0 0 auto",
        cursor: dom.getCursor(ctx),
        minHeight: ctx.isHorizontal ? "0px" : undefined,
        minWidth: ctx.isHorizontal ? undefined : "0px",
      },
      onPointerDown(event) {
        if (ctx.disabled) {
          event.preventDefault()
          return
        }
        send("POINTER_DOWN")
        event.preventDefault()
        event.stopPropagation()
      },
      onPointerOver() {
        if (ctx.disabled) return
        send("POINTER_OVER")
      },
      onPointerLeave() {
        if (ctx.disabled) return
        send("POINTER_LEAVE")
      },
      onBlur() {
        send("BLUR")
      },
      onFocus() {
        send("FOCUS")
      },
      onDoubleClick() {
        if (ctx.disabled) return
        send("DOUBLE_CLICK")
      },
      onKeyDown(event) {
        if (ctx.disabled) return
        const step = getEventStep(event) * ctx.step
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

        const key = getEventKey(event, ctx)
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
