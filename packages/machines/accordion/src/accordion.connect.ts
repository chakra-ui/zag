import { dataAttr, EventKeyMap, getEventKey } from "@ui-machines/dom-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { isArray } from "@ui-machines/utils"
import { dom } from "./accordion.dom"
import type { ItemProps, Send, State } from "./accordion.types"

export function connect<T extends PropTypes = ReactPropTypes>(state: State, send: Send, normalize = normalizeProp) {
  const { context: ctx } = state

  function getItemState(props: ItemProps) {
    const { value, disabled } = props
    return {
      isOpen: isArray(ctx.value) ? ctx.value.includes(value) : value === ctx.value,
      isFocused: ctx.focusedValue === value,
      isDisabled: disabled ?? ctx.disabled,
    }
  }

  return {
    value: ctx.value,
    setValue(value: string | string[]) {
      if (ctx.multiple && !Array.isArray(value)) {
        value = [value]
      }
      send({ type: "SET_VALUE", value })
    },

    rootProps: normalize.element<T>({
      "data-part": "root",
      id: dom.getRootId(ctx),
    }),

    getItemState,

    getItemProps(props: ItemProps) {
      const { isOpen } = getItemState(props)
      return normalize.element<T>({
        "data-part": "item",
        id: dom.getGroupId(ctx, props.value),
        "data-expanded": dataAttr(isOpen),
      })
    },

    getContentProps(props: ItemProps) {
      const { isOpen, isFocused, isDisabled } = getItemState(props)
      return normalize.element<T>({
        "data-part": "content",
        role: "region",
        id: dom.getPanelId(ctx, props.value),
        "aria-labelledby": dom.getTriggerId(ctx, props.value),
        hidden: !isOpen,
        "data-disabled": dataAttr(isDisabled),
        "data-focus": dataAttr(isFocused),
        "data-expanded": dataAttr(isOpen),
      })
    },

    getTriggerProps(props: ItemProps) {
      const { value } = props
      const { isDisabled, isOpen } = getItemState(props)
      return normalize.button<T>({
        "data-part": "trigger",
        type: "button",
        id: dom.getTriggerId(ctx, value),
        "aria-controls": dom.getPanelId(ctx, value),
        "aria-expanded": isOpen,
        disabled: isDisabled,
        "aria-disabled": isDisabled,
        "data-expanded": dataAttr(isOpen),
        "data-ownedby": dom.getRootId(ctx),
        onFocus() {
          if (isDisabled) return
          send({ type: "FOCUS", value })
        },
        onBlur() {
          if (isDisabled) return
          send("BLUR")
        },
        onClick() {
          if (isDisabled) return
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
            Enter() {
              send({ type: "CLICK", value })
            },
            Home() {
              send({ type: "HOME", value })
            },
            End() {
              send({ type: "END", value })
            },
          }

          const key = getEventKey(event, {
            dir: ctx.dir,
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
}
