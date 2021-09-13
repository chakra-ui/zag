import { is } from "@core-foundation/utils"
import { Point } from "@core-graphics/point"
import { StateMachine as S } from "@ui-machines/core"
import { dataAttr, defaultPropNormalizer } from "../utils/dom-attr"
import { getEventKey } from "../utils/get-event-key"
import { EventKeyMap, HTMLProps, InputProps } from "../utils/types"
import { getIds } from "./rating.dom"
import { RatingMachineContext, RatingMachineState } from "./rating.machine"

export function ratingConnect(
  state: S.State<RatingMachineContext, RatingMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = defaultPropNormalizer,
) {
  const { context: ctx } = state

  const isInteractive = !(ctx.disabled || ctx.readonly)
  const isHovering = ctx.hoveredValue !== -1

  const ids = getIds(ctx.uid)

  const result = {
    isHovering,
    value: ctx.value,
    hoveredValue: ctx.hoveredValue,
    size: ctx.max,

    getRatingState: (index: number) => {
      const value = isHovering ? ctx.hoveredValue : ctx.value
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
    },

    inputProps: normalize<InputProps>({
      name: ctx.name,
      type: "hidden",
      id: ids.input,
      value: ctx.value,
    }),

    labelProps: normalize<HTMLProps>({
      id: ids.label,
      "data-disabled": ctx.disabled,
    }),

    rootProps: normalize<HTMLProps>({
      id: ids.root,
      role: "radiogroup",
      "aria-orientation": "horizontal",
      "aria-labelledby": ids.label,
      tabIndex: ctx.readonly ? 0 : -1,
      onPointerMove() {
        if (!isInteractive) return
        send("GROUP_POINTER_OVER")
      },
      onPointerLeave() {
        if (!isInteractive) return
        send("GROUP_POINTER_LEAVE")
      },
    }),

    getRatingProps({ index }: { index: number }) {
      const { isHalf, isHighlighted, isChecked } = result.getRatingState(index)
      const valueText = ctx.getLabelText?.(index) ?? `${index} stars`

      return normalize<HTMLProps>({
        id: ids.getRatingId(index),
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
          if (is.leftClickEvent(event.nativeEvent)) {
            event.preventDefault()
          }
        },
        onPointerMove(event) {
          if (!isInteractive) return
          const point = Point.fromPointerEvent(event.nativeEvent)
          const { progress } = point.relativeToNode(event.currentTarget)
          const isMidway = progress.x < 0.5
          send({ type: "POINTER_OVER", index, isMidway })
        },
        onKeyDown(event) {
          if (!isInteractive) return
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
          if (!isInteractive) return
          send("CLICK")
        },
        onFocus() {
          if (!isInteractive) return
          send("FOCUS")
        },
        onBlur() {
          if (!isInteractive) return
          send("BLUR")
        },
      })
    },
  }

  return result
}
