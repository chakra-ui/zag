import { dataAttr, EventKeyMap, getEventKey, getNativeEvent } from "@zag-js/dom-utils"
import { getEventPoint, relativeToNode } from "@zag-js/rect-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@zag-js/types"
import { cast, isLeftClick } from "@zag-js/utils"
import { dom } from "./rating.dom"
import { Send, State } from "./rating.types"

export function connect<T extends PropTypes = ReactPropTypes>(state: State, send: Send, normalize = normalizeProp) {
  const isInteractive = state.context.isInteractive
  const value = state.context.value
  const isDisabled = state.context.disabled
  const messages = state.context.messages

  const api = {
    isHovering: state.context.isHovering,
    value,
    hoveredValue: state.context.hoveredValue,
    size: state.context.max,
    sizeArray: Array.from({ length: state.context.max }).map((_, index) => index + 1),
    getRatingState(index: number) {
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
    },

    rootProps: normalize.element<T>({
      dir: state.context.dir,
      "data-part": "root",
      id: dom.getRootId(state.context),
    }),

    inputProps: normalize.input<T>({
      "data-part": "input",
      name: state.context.name,
      type: "text",
      hidden: true,
      id: dom.getInputId(state.context),
      value: state.context.value,
    }),

    labelProps: normalize.element<T>({
      "data-part": "label",
      id: dom.getLabelId(state.context),
      "data-disabled": dataAttr(isDisabled),
    }),

    itemGroupProps: normalize.element<T>({
      id: dom.getItemGroupId(state.context),
      "data-part": "item-group",
      role: "radiogroup",
      "aria-orientation": "horizontal",
      "aria-labelledby": dom.getLabelId(state.context),
      tabIndex: state.context.readonly ? 0 : -1,
      "data-disabled": dataAttr(isDisabled),
      onPointerMove() {
        if (!isInteractive) return
        send("GROUP_POINTER_OVER")
      },
      onPointerLeave() {
        if (!isInteractive) return
        send("GROUP_POINTER_LEAVE")
      },
    }),

    getItemProps({ index }: { index: number }) {
      const { isHalf, isHighlighted, isChecked } = api.getRatingState(index)
      const valueText = messages.ratingValueText(index)

      return normalize.element<T>({
        "data-part": "item",
        id: dom.getItemId(state.context, index.toString()),
        role: "radio",
        tabIndex: isDisabled ? undefined : isChecked ? 0 : -1,
        "aria-roledescription": "rating",
        "aria-label": valueText,
        "aria-disabled": isDisabled,
        "data-disabled": dataAttr(isDisabled),
        "aria-readonly": state.context.readonly,
        "data-readonly": dataAttr(state.context.readonly),
        "aria-setsize": state.context.max,
        "aria-checked": isChecked,
        "aria-posinset": index,
        "data-highlighted": dataAttr(isHighlighted),
        "data-half": dataAttr(isHalf),
        onPointerDown(event) {
          if (!isInteractive) return
          const evt = getNativeEvent(event)
          if (isLeftClick(evt)) {
            event.preventDefault()
          }
        },
        onPointerMove(event) {
          if (!isInteractive) return
          const point = getEventPoint(cast(event))
          const { progress } = relativeToNode(point, event.currentTarget)
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

          const key = getEventKey(event, state.context)
          const exec = keyMap[key]

          if (exec) {
            event.preventDefault()
            exec(event)
          }
        },
        onClick() {
          if (!isInteractive) return
          send({ type: "CLICK", value: index })
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

  return api
}
