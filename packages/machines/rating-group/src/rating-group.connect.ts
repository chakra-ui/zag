import {
  getEventKey,
  getEventPoint,
  getNativeEvent,
  getRelativePoint,
  isLeftClick,
  type EventKeyMap,
} from "@zag-js/dom-event"
import { ariaAttr, dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./rating-group.anatomy"
import { dom } from "./rating-group.dom"
import type { ItemProps, ItemState, MachineApi, Send, State } from "./rating-group.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const isInteractive = state.context.isInteractive
  const isDisabled = state.context.isDisabled

  const value = state.context.value
  const hoveredValue = state.context.hoveredValue
  const translations = state.context.translations

  const api = {
    setValue(value: number) {
      send({ type: "SET_VALUE", value })
    },

    clearValue() {
      send("CLEAR_VALUE")
    },

    isHovering: state.context.isHovering,
    value,
    hoveredValue,
    size: state.context.max,
    sizeArray: Array.from({ length: state.context.max }).map((_, index) => index + 1),

    getRatingState(props: ItemProps): ItemState {
      const value = state.context.isHovering ? state.context.hoveredValue : state.context.value
      const isEqual = Math.ceil(value) === props.index

      const isHighlighted = props.index <= value || isEqual
      const isHalf = isEqual && Math.abs(value - props.index) === 0.5

      return {
        isEqual,
        isValueEmpty: state.context.value === -1,
        isHighlighted,
        isHalf,
        isChecked: isEqual || (state.context.value === -1 && props.index === 1),
      }
    },

    rootProps: normalize.element({
      dir: state.context.dir,
      ...parts.root.attrs,
      id: dom.getRootId(state.context),
    }),

    hiddenInputProps: normalize.input({
      name: state.context.name,
      form: state.context.form,
      type: "text",
      hidden: true,
      id: dom.getHiddenInputId(state.context),
      defaultValue: state.context.value,
    }),

    labelProps: normalize.element({
      ...parts.label.attrs,
      id: dom.getLabelId(state.context),
      "data-disabled": dataAttr(isDisabled),
    }),

    controlProps: normalize.element({
      id: dom.getControlId(state.context),
      ...parts.control.attrs,
      role: "radiogroup",
      "aria-orientation": "horizontal",
      "aria-labelledby": dom.getLabelId(state.context),
      tabIndex: state.context.readOnly ? 0 : -1,
      "data-disabled": dataAttr(isDisabled),
      onPointerMove(event) {
        if (!isInteractive || event.pointerType === "touch") return
        send("GROUP_POINTER_OVER")
      },
      onPointerLeave(event) {
        if (!isInteractive || event.pointerType === "touch") return
        send("GROUP_POINTER_LEAVE")
      },
    }),

    getRatingProps(props: ItemProps) {
      const { index } = props
      const { isHalf, isHighlighted, isChecked } = api.getRatingState(props)
      const valueText = translations.ratingValueText(index)

      return normalize.element({
        ...parts.rating.attrs,
        id: dom.getRatingId(state.context, index.toString()),
        role: "radio",
        tabIndex: isDisabled ? undefined : isChecked ? 0 : -1,
        "aria-roledescription": "rating",
        "aria-label": valueText,
        "aria-disabled": isDisabled,
        "data-disabled": dataAttr(isDisabled),
        "aria-readonly": ariaAttr(state.context.readOnly),
        "data-readonly": dataAttr(state.context.readOnly),
        "aria-setsize": state.context.max,
        "aria-checked": isChecked,
        "data-checked": dataAttr(isChecked),
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
          const point = getEventPoint(getNativeEvent(event))
          const relativePoint = getRelativePoint(point, event.currentTarget)
          const percentX = relativePoint.getPercentValue({
            orientation: "horizontal",
            dir: state.context.dir,
          })
          const isMidway = percentX < 0.5
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
              send("ARROW_RIGHT")
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
