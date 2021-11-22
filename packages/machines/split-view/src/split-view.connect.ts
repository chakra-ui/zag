import { StateMachine as S } from "@ui-machines/core"
import { dataAttr, EventKeyMap, getEventKey, getEventStep } from "@ui-machines/dom-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { dom } from "./split-view.dom"
import { SplitViewMachineContext, SplitViewMachineState } from "./split-view.machine"

export function splitViewConnect<T extends PropTypes = ReactPropTypes>(
  state: S.State<SplitViewMachineContext, SplitViewMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = normalizeProp,
) {
  const { context: ctx } = state
  const isFocused = state.matches("hover", "dragging", "focused")

  return {
    isCollapsed: ctx.isCollapsed,
    isFocused,

    collapse() {
      send("COLLAPSE")
    },

    expand() {
      send("EXPAND")
    },

    toggle() {
      send("TOGGLE")
    },

    rootProps: normalize.element<T>({
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
      id: dom.getSecondaryPaneId(ctx),
      style: {
        height: ctx.isHorizontal ? "100%" : "auto",
        width: ctx.isHorizontal ? "auto" : "100%",
        flex: "1 1 0%",
        position: "relative",
      },
    }),

    primaryPaneProps: normalize.element<T>({
      id: dom.getPrimaryPaneId(ctx),
      style: {
        width: `${ctx.value}px`,
        minWidth: `${ctx.min}px`,
        maxWidth: `${ctx.max}px`,
        visibility: "visible",
        flex: "0 0 auto",
        position: "relative",
        userSelect: state.matches("dragging") ? "none" : "auto",
      },
    }),

    toggleButtonProps: normalize.element<T>({
      id: dom.getToggleButtonId(ctx),
      "aria-label": ctx.isCollapsed ? "Expand Primary Pane" : "Collapse Primary Pane",
      onClick() {
        send("TOGGLE")
      },
    }),

    labelProps: normalize.element<T>({
      id: dom.getSplitterLabelId(ctx),
    }),

    splitterProps: normalize.element<T>({
      id: dom.getSplitterId(ctx),
      role: "separator",
      tabIndex: 0,
      "aria-valuenow": ctx.value,
      "aria-valuemin": ctx.min,
      "aria-valuemax": ctx.max,
      "aria-orientation": ctx.orientation,
      "aria-labelledby": dom.getSplitterLabelId(ctx),
      "aria-controls": dom.getPrimaryPaneId(ctx),
      "data-focus": dataAttr(state.matches("hover", "dragging", "focused")),
      style: {
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        msUserSelect: "none",
        flex: "0 0 auto",
        cursor: ctx.isHorizontal ? "col-resize" : "row-resize",
        minHeight: ctx.isHorizontal ? "0px" : undefined,
        minWidth: ctx.isHorizontal ? undefined : "0px",
      },
      onPointerDown(event) {
        if (event.button !== 0) return

        event.preventDefault()
        event.stopPropagation()

        send("POINTER_DOWN")
      },
      onPointerOver() {
        send("POINTER_OVER")
      },
      onPointerLeave() {
        send("POINTER_LEAVE")
      },
      onBlur() {
        send("BLUR")
      },
      onFocus() {
        send("FOCUS")
      },
      onDoubleClick() {
        send("DOUBLE_CLICK")
      },
      onKeyDown(event) {
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
          event.preventDefault()
          event.stopPropagation()
          exec(event)
        }
      },
    }),
  }
}
