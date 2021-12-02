import { StateMachine as S } from "@ui-machines/core"
import { dataAttr, EventKeyMap, getEventKey } from "@ui-machines/dom-utils"
import { getEventPoint, relativeToNode } from "@ui-machines/rect-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { cast, isLeftClick } from "@ui-machines/utils"
import { dom } from "./rating.dom"
import { RatingMachineContext, RatingMachineState } from "./rating.machine"

export function ratingConnect<T extends PropTypes = ReactPropTypes>(
  state: S.State<RatingMachineContext, RatingMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = normalizeProp,
) {
  const { context: ctx } = state

  const getRatingState = (index: number) => {
    const value = ctx.isHovering ? ctx.hoveredValue : ctx.value
    const isEqual = Math.ceil(value) === index

    const isHighlighted = index <= value || isEqual
    const isHalf = isEqual && Math.abs(value - index) === 0.5

    return {
      isEqual,
      isValueEmpty: ctx.value === -1,
      isHighlighted,
      isHalf,
      isChecked: isEqual || (ctx.value === -1 && index === 1),
    }
  }

  return {
    isHovering: ctx.isHovering,
    value: ctx.value,
    hoveredValue: ctx.hoveredValue,
    size: ctx.max,

    getRatingState,
    inputProps: normalize.input<T>({
      "data-part": "input",
      name: ctx.name,
      type: "hidden",
      id: dom.getInputId(ctx),
      value: ctx.value,
    }),

    labelProps: normalize.element<T>({
      "data-part": "label",
      id: dom.getLabelId(ctx),
      "data-disabled": ctx.disabled,
    }),

    rootProps: normalize.element<T>({
      "data-part": "root",
      id: dom.getRootId(ctx),
      role: "radiogroup",
      "aria-orientation": "horizontal",
      "aria-labelledby": dom.getLabelId(ctx),
      tabIndex: ctx.readonly ? 0 : -1,
      onPointerMove() {
        if (!ctx.isInteractive) return
        send("GROUP_POINTER_OVER")
      },
      onPointerLeave() {
        if (!ctx.isInteractive) return
        send("GROUP_POINTER_LEAVE")
      },
    }),

    getRatingProps({ index }: { index: number }) {
      const { isHalf, isHighlighted, isChecked } = getRatingState(index)
      const valueText = ctx.getLabelText?.(index) ?? `${index} stars`

      return normalize.element<T>({
        "data-part": "rating",
        id: dom.getRatingId(ctx, index),
        role: "radio",
        tabIndex: isChecked ? 0 : -1,
        "aria-roledescription": "rating",
        "aria-label": valueText,
        "aria-disabled": ctx.disabled,
        "aria-readonly": ctx.readonly,
        "aria-setsize": ctx.max,
        "aria-checked": isChecked,
        "aria-posinset": index,
        "data-highlighted": dataAttr(isHighlighted),
        "data-half": dataAttr(isHalf),
        onPointerDown(event) {
          if (isLeftClick(cast(event))) {
            event.preventDefault()
          }
        },
        onPointerMove(event) {
          if (!ctx.isInteractive) return
          const point = getEventPoint(cast(event))
          const { progress } = relativeToNode(point, event.currentTarget)
          const isMidway = progress.x < 0.5
          send({ type: "POINTER_OVER", index, isMidway })
        },
        onKeyDown(event) {
          if (!ctx.isInteractive) return
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

          const key = getEventKey(event, ctx)
          const exec = keyMap[key]

          if (exec) {
            event.preventDefault()
            exec(event)
          }
        },
        onClick() {
          if (!ctx.isInteractive) return
          send("CLICK")
        },
        onFocus() {
          if (!ctx.isInteractive) return
          send("FOCUS")
        },
        onBlur() {
          if (!ctx.isInteractive) return
          send("BLUR")
        },
      })
    },
  }
}
