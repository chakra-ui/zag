import {
  defaultPropNormalizer,
  PropNormalizer,
  StateMachine as S,
} from "@ui-machines/core"
import { cast } from "@ui-machines/utils/function"
import { Point } from "@ui-machines/utils/point"
import { Rect } from "@ui-machines/utils/rect"
import { determineEventKey } from "../event-utils"
import {
  DOMHTMLProps,
  DOMInputProps,
  EventKeyMap,
  WithDataAttr,
} from "../type-utils"
import { getElementIds } from "./rating.dom"
import { RatingMachineContext, RatingMachineState } from "./rating.machine"

export function connectRatingMachine(
  state: S.State<RatingMachineContext, RatingMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize: PropNormalizer = defaultPropNormalizer,
) {
  const { context: ctx } = state
  const isHovering = ctx.hoveredValue !== -1

  const { inputId, rootId, getRatingId } = getElementIds(ctx.uid)

  return {
    inputProps: normalize<DOMInputProps>({
      name: ctx.name,
      type: "hidden",
      id: inputId,
      value: ctx.value,
    }),

    rootProps: normalize<DOMHTMLProps>({
      id: rootId,
      role: "radiogroup",
      onPointerEnter() {
        send("GROUP_POINTER_OVER")
      },
      onPointerLeave() {
        send("GROUP_POINTER_LEAVE")
      },
    }),

    getRatingProps({ index }: { index: number }) {
      const effectiveIndex = isHovering ? ctx.hoveredValue : ctx.value
      const isHighlighted = index <= effectiveIndex

      const tabIndex =
        ctx.value <= 0 && index === 1 ? 1 : index === ctx.value ? 0 : -1

      return normalize<WithDataAttr<DOMHTMLProps>>({
        id: getRatingId(index),
        role: "radio",
        tabIndex,
        "aria-setsize": 5,
        "aria-checked": index < ctx.value,
        "aria-posinset": index,
        "data-highlighted": isHighlighted || undefined,
        onPointerMove(event) {
          const rect = Rect.fromElement(event.currentTarget)
          const point = Point.fromPointerEvent(cast(event))
          const isMidway = point.x < rect.centerPoint.x
          send({ type: "POINTER_OVER", index, isMidway })
        },
        onKeyDown(event) {
          const keyMap: EventKeyMap = {
            ArrowLeft() {
              send("ARROW_LEFT")
            },
            ArrowRight() {
              send("ARROW_RIGHT")
            },
            " "() {
              send("SPACE")
            },
            Home() {
              send("GO_TO_MIN")
            },
            End() {
              send("GO_TO_MAX")
            },
          }

          const key = determineEventKey(event, ctx)
          const exec = keyMap[key]

          if (exec) {
            event.preventDefault()
            exec(event)
          }
        },
        onClick() {
          send("CLICK")
        },
        onFocus() {
          send({ type: "FOCUS", index })
        },
        onBlur() {
          send("BLUR")
        },
      })
    },
  }
}
