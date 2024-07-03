import { getEventKey, getEventPoint, getRelativePoint, isLeftClick, type EventKeyMap } from "@zag-js/dom-event"
import { ariaAttr, dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./rating-group.anatomy"
import { dom } from "./rating-group.dom"
import type { ItemProps, ItemState, MachineApi, Send, State } from "./rating-group.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const interactive = state.context.isInteractive
  const disabled = state.context.isDisabled
  const value = state.context.value
  const hoveredValue = state.context.hoveredValue
  const translations = state.context.translations

  function getItemState(props: ItemProps): ItemState {
    const value = state.context.isHovering ? state.context.hoveredValue : state.context.value
    const equal = Math.ceil(value) === props.index
    const highlighted = props.index <= value || equal
    const half = equal && Math.abs(value - props.index) === 0.5

    return {
      highlighted,
      half,
      checked: equal || (state.context.value === -1 && props.index === 1),
    }
  }

  return {
    hovering: state.context.isHovering,
    value,
    hoveredValue,
    count: state.context.count,
    items: Array.from({ length: state.context.count }).map((_, index) => index + 1),

    setValue(value) {
      send({ type: "SET_VALUE", value })
    },
    clearValue() {
      send("CLEAR_VALUE")
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        dir: state.context.dir,
        id: dom.getRootId(state.context),
      })
    },

    getHiddenInputProps() {
      return normalize.input({
        name: state.context.name,
        form: state.context.form,
        type: "text",
        hidden: true,
        disabled,
        readOnly: state.context.readOnly,
        required: state.context.required,
        id: dom.getHiddenInputId(state.context),
        defaultValue: state.context.value,
      })
    },

    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs,
        dir: state.context.dir,
        id: dom.getLabelId(state.context),
        "data-disabled": dataAttr(disabled),
        htmlFor: dom.getHiddenInputId(state.context),
        onClick(event) {
          if (event.defaultPrevented) return
          if (!interactive) return
          event.preventDefault()
          const radioEl = dom.getRadioEl(state.context, 1)
          radioEl?.focus({ preventScroll: true })
        },
      })
    },

    getControlProps() {
      return normalize.element({
        id: dom.getControlId(state.context),
        ...parts.control.attrs,
        dir: state.context.dir,
        role: "radiogroup",
        "aria-orientation": "horizontal",
        "aria-labelledby": dom.getLabelId(state.context),
        "aria-readonly": ariaAttr(state.context.readOnly),
        "data-readonly": dataAttr(state.context.readOnly),
        tabIndex: state.context.readOnly ? 0 : -1,
        "data-disabled": dataAttr(disabled),
        onPointerMove(event) {
          if (!interactive) return
          if (event.pointerType === "touch") return
          send("GROUP_POINTER_OVER")
        },
        onPointerLeave(event) {
          if (!interactive) return
          if (event.pointerType === "touch") return
          send("GROUP_POINTER_LEAVE")
        },
      })
    },

    getItemState,

    getItemProps(props) {
      const { index } = props
      const itemState = getItemState(props)
      const valueText = translations.ratingValueText(index)

      return normalize.element({
        ...parts.item.attrs,
        dir: state.context.dir,
        id: dom.getItemId(state.context, index.toString()),
        role: "radio",
        tabIndex: disabled ? undefined : itemState.checked ? 0 : -1,
        "aria-roledescription": "rating",
        "aria-label": valueText,
        "aria-disabled": disabled,
        "data-disabled": dataAttr(disabled),
        "data-readonly": dataAttr(state.context.readOnly),
        "aria-setsize": state.context.count,
        "aria-checked": itemState.checked,
        "data-checked": dataAttr(itemState.checked),
        "aria-posinset": index,
        "data-highlighted": dataAttr(itemState.highlighted),
        "data-half": dataAttr(itemState.half),
        onPointerDown(event) {
          if (!interactive) return
          if (!isLeftClick(event)) return
          event.preventDefault()
        },
        onPointerMove(event) {
          if (!interactive) return
          const point = getEventPoint(event)
          const relativePoint = getRelativePoint(point, event.currentTarget)
          const percentX = relativePoint.getPercentValue({
            orientation: "horizontal",
            dir: state.context.dir,
          })
          const isMidway = percentX < 0.5
          send({ type: "POINTER_OVER", index, isMidway })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (!interactive) return

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
          if (!interactive) return
          send({ type: "CLICK", value: index })
        },
        onFocus() {
          if (!interactive) return
          send("FOCUS")
        },
        onBlur() {
          if (!interactive) return
          send("BLUR")
        },
      })
    },
  }
}
