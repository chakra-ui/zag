import { dataAttr, EventKeyMap, getEventKey } from "@zag-js/dom-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@zag-js/types"
import { isArray, isSafari } from "@zag-js/utils"
import { dom } from "./accordion.dom"
import type { ItemProps, Send, State } from "./accordion.types"

export function connect<T extends PropTypes = ReactPropTypes>(state: State, send: Send, normalize = normalizeProp) {
  const focusedValue = state.context.focusedValue
  const value = state.context.value
  const multiple = state.context.multiple

  const api = {
    value: value,
    setValue(value: string | string[]) {
      if (multiple && !Array.isArray(value)) {
        value = [value]
      }
      send({ type: "SET_VALUE", value })
    },

    rootProps: normalize.element<T>({
      "data-part": "root",
      id: dom.getRootId(state.context),
    }),

    getItemState(props: ItemProps) {
      return {
        isOpen: isArray(value) ? value.includes(props.value) : props.value === value,
        isFocused: focusedValue === props.value,
        isDisabled: props.disabled ?? state.context.disabled,
      }
    },

    getItemProps(props: ItemProps) {
      const { isOpen, isFocused } = api.getItemState(props)
      return normalize.element<T>({
        "data-part": "item",
        id: dom.getItemId(state.context, props.value),
        "data-expanded": dataAttr(isOpen),
        "data-focus": dataAttr(isFocused),
      })
    },

    getContentProps(props: ItemProps) {
      const { isOpen, isFocused, isDisabled } = api.getItemState(props)
      return normalize.element<T>({
        "data-part": "content",
        role: "region",
        id: dom.getContentId(state.context, props.value),
        "aria-labelledby": dom.getTriggerId(state.context, props.value),
        hidden: !isOpen,
        "data-disabled": dataAttr(isDisabled),
        "data-focus": dataAttr(isFocused),
        "data-expanded": dataAttr(isOpen),
      })
    },

    getTriggerProps(props: ItemProps) {
      const { value } = props
      const { isDisabled, isOpen } = api.getItemState(props)
      return normalize.button<T>({
        "data-part": "trigger",
        type: "button",
        id: dom.getTriggerId(state.context, value),
        "aria-controls": dom.getContentId(state.context, value),
        "aria-expanded": isOpen,
        disabled: isDisabled,
        "aria-disabled": isDisabled,
        "data-expanded": dataAttr(isOpen),
        "data-ownedby": dom.getRootId(state.context),
        onFocus() {
          if (isDisabled) return
          send({ type: "FOCUS", value })
        },
        onBlur() {
          if (isDisabled) return
          send("BLUR")
        },
        onClick(event) {
          if (isDisabled) return
          if (isSafari()) {
            event.currentTarget.focus()
          }
          send({ type: "CLICK", value })
        },
        onKeyDown(event) {
          if (isDisabled) return

          const keyMap: EventKeyMap = {
            ArrowDown() {
              send({ type: "ARROW_DOWN", value })
            },
            ArrowUp() {
              send({ type: "ARROW_UP", value })
            },
            Home() {
              send({ type: "HOME", value })
            },
            End() {
              send({ type: "END", value })
            },
          }

          const key = getEventKey(event, {
            dir: state.context.dir,
            orientation: "vertical",
          })

          const exec = keyMap[key]

          if (exec) {
            exec(event)
            event.preventDefault()
          }
        },
      })
    },
  }

  return api
}
