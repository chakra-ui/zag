import { StateMachine as S } from "@ui-machines/core"
import { dataAttr, defaultPropNormalizer } from "../utils/dom-attr"
import { getEventKey } from "../utils/get-event-key"
import { getEventStep } from "../utils/get-step"
import { EventKeyMap, HTMLProps } from "../utils/types"
import { getElementIds } from "./split-view.dom"
import { SplitViewMachineContext, SplitViewMachineState } from "./split-view.machine"

export function connectSplitViewMachine(
  state: S.State<SplitViewMachineContext, SplitViewMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = defaultPropNormalizer,
) {
  const { context: ctx } = state
  const ids = getElementIds(ctx.uid)

  const isHorizontal = ctx.orientation === "horizontal"

  const isCollapsed = ctx.value === ctx.min
  const isFocused = state.matches("hover", "dragging", "focused")

  return {
    isCollapsed,
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

    rootProps: normalize<HTMLProps>({
      id: ids.root,
      style: {
        display: "flex",
        flex: "1 1 0%",
        height: isHorizontal ? "100%" : "auto",
        width: isHorizontal ? "auto" : "100%",
        flexDirection: isHorizontal ? "row" : "column",
      },
    }),

    secondaryPaneProps: normalize<HTMLProps>({
      id: ids.secondaryPane,
      style: {
        height: isHorizontal ? "100%" : "auto",
        width: isHorizontal ? "auto" : "100%",
        flex: "1 1 0%",
        position: "relative",
      },
    }),

    primaryPaneProps: normalize<HTMLProps>({
      id: ids.primaryPane,
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

    toggleButtonProps: normalize<HTMLProps>({
      id: ids.toggleButton,
      "aria-label": isCollapsed ? "Expand Primary Pane" : "Collapse Primary Pane",
      onClick() {
        send("TOGGLE")
      },
    }),

    labelProps: normalize<HTMLProps>({
      id: ids.splitterLabel,
    }),

    splitterProps: normalize<HTMLProps>({
      id: ids.splitter,
      role: "separator",
      tabIndex: 0,
      "aria-valuenow": ctx.value,
      "aria-valuemin": ctx.min,
      "aria-valuemax": ctx.max,
      "aria-orientation": ctx.orientation,
      "aria-labelledby": ids.splitterLabel,
      "aria-controls": ids.primaryPane,
      "data-focus": dataAttr(state.matches("hover", "dragging", "focused")),
      style: {
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        msUserSelect: "none",
        flex: "0 0 auto",
        cursor: isHorizontal ? "col-resize" : "row-resize",
        minHeight: isHorizontal ? "0px" : undefined,
        minWidth: isHorizontal ? undefined : "0px",
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
