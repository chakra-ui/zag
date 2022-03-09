import { StateMachine as S } from "@ui-machines/core"
import { dataAttr, EventKeyMap, getEventKey, getNativeEvent } from "@ui-machines/dom-utils"
import { getEventPoint, relativeToNode } from "@ui-machines/rect-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { cast, isLeftClick } from "@ui-machines/utils"
import { dom } from "./rating.dom"
import { MachineContext, MachineState } from "./rating.types"

export function connect<T extends PropTypes = ReactPropTypes>(
  state: S.State<MachineContext, MachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = normalizeProp,
) {
  const getRatingState = (index: number) => {
    const value = state.context.isHovering ? state.context.hoveredValue : state.context.value
    const isEqual = Math.ceil(value) === index

    const isHighlighted = index <= value || isEqual
    const isHalf = isEqual && Math.abs(value - index) === 0.5

    return {
      isEqual,
      isValueEmpty: state.context.value === -1,
      isHighlighted,
      isHalf,
      isChecked: isEqual || (state.context.value === -1 && index === 1),
    }
  }

  return {
    isHovering: state.context.isHovering,
    value: state.context.value,
    hoveredValue: state.context.hoveredValue,
    size: state.context.max,
    sizeArray: Array.from({ length: state.context.max }).map((_, index) => index + 1),

    getRatingState,
    inputProps: normalize.input<T>({
      "data-part": "input",
      name: state.context.name,
      type: "hidden",
      id: dom.getInputId(state.context),
      value: state.context.value,
    }),

    labelProps: normalize.element<T>({
      "data-part": "label",
      id: dom.getLabelId(state.context),
      "data-disabled": state.context.disabled,
    }),

    rootProps: normalize.element<T>({
      dir: state.context.dir,
      "data-part": "root",
      id: dom.getRootId(state.context),
      role: "radiogroup",
      "aria-orientation": "horizontal",
      "aria-labelledby": dom.getLabelId(state.context),
      tabIndex: state.context.readonly ? 0 : -1,
      "data-disabled": dataAttr(state.context.disabled),
      onPointerMove() {
        if (!state.context.isInteractive) return
        send("GROUP_POINTER_OVER")
      },
      onPointerLeave() {
        if (!state.context.isInteractive) return
        send("GROUP_POINTER_LEAVE")
      },
    }),

    getRatingProps({ index }: { index: number }) {
      const { isHalf, isHighlighted, isChecked } = getRatingState(index)
      const valueText = state.context.getLabelText?.(index) ?? `${index} stars`

      return normalize.element<T>({
        "data-part": "rating",
        id: dom.getRatingId(state.context, index),
        role: "radio",
        tabIndex: state.context.disabled ? -1 : isChecked ? 0 : -1,
        "aria-roledescription": "rating",
        "aria-label": valueText,
        "aria-disabled": state.context.disabled,
        "data-disabled": dataAttr(state.context.disabled),
        "aria-readonly": state.context.readonly,
        "aria-setsize": state.context.max,
        "aria-checked": isChecked,
        "aria-posinset": index,
        "data-highlighted": dataAttr(isHighlighted),
        "data-half": dataAttr(isHalf),
        onPointerDown(event) {
          if (!state.context.isInteractive) return
          const evt = getNativeEvent(event)
          if (isLeftClick(evt)) {
            event.preventDefault()
          }
        },
        onPointerMove(event) {
          if (!state.context.isInteractive) return
          const point = getEventPoint(cast(event))
          const { progress } = relativeToNode(point, event.currentTarget)
          const isMidway = progress.x < 0.5
          send({ type: "POINTER_OVER", index, isMidway })
        },
        onKeyDown(event) {
          if (!state.context.isInteractive) return
          const keyMap: EventKeyMap = {
            ArrowLeft() {
              send("ARROW_LEFT")
            },
            ArrowRight() {
              send("ARROW_RIGHT")
            },
            ArrowUp() {
              send("ARROW_LEFT")
            },
            ArrowDown() {
              send("ARROW_LEFT")
            },
            Space() {
              send({ type: "SPACE", value: index })
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
            event.preventDefault()
            exec(event)
          }
        },
        onClick() {
          if (!state.context.isInteractive) return
          send("CLICK")
        },
        onFocus() {
          if (!state.context.isInteractive) return
          send("FOCUS")
        },
        onBlur() {
          if (!state.context.isInteractive) return
          send("BLUR")
        },
      })
    },
  }
}
