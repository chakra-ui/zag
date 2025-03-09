import { dataAttr, getEventKey, isSafari } from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import type { Service } from "@zag-js/core"
import { parts } from "./accordion.anatomy"
import * as dom from "./accordion.dom"
import type { AccordionApi, AccordionSchema, ItemProps, ItemState } from "./accordion.types"

export function connect<T extends PropTypes>(
  service: Service<AccordionSchema>,
  normalize: NormalizeProps<T>,
): AccordionApi<T> {
  const { send, context, prop, scope, computed } = service

  const focusedValue = context.get("focusedValue")
  const value = context.get("value")
  const multiple = prop("multiple")

  function setValue(value: string[]) {
    let nextValue = value
    if (!multiple && nextValue.length > 1) {
      nextValue = [nextValue[0]]
    }
    send({ type: "VALUE.SET", value: nextValue })
  }

  function getItemState(props: ItemProps): ItemState {
    return {
      expanded: value.includes(props.value),
      focused: focusedValue === props.value,
      disabled: Boolean(props.disabled ?? prop("disabled")),
    }
  }

  return {
    focusedValue,
    value,
    setValue,
    getItemState,

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        dir: prop("dir"),
        id: dom.getRootId(scope),
        "data-orientation": prop("orientation"),
      })
    },

    getItemProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.item.attrs,
        dir: prop("dir"),
        id: dom.getItemId(scope, props.value),
        "data-state": itemState.expanded ? "open" : "closed",
        "data-focus": dataAttr(itemState.focused),
        "data-disabled": dataAttr(itemState.disabled),
        "data-orientation": prop("orientation"),
      })
    },

    getItemContentProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.itemContent.attrs,
        dir: prop("dir"),
        role: "region",
        id: dom.getItemContentId(scope, props.value),
        "aria-labelledby": dom.getItemTriggerId(scope, props.value),
        hidden: !itemState.expanded,
        "data-state": itemState.expanded ? "open" : "closed",
        "data-disabled": dataAttr(itemState.disabled),
        "data-focus": dataAttr(itemState.focused),
        "data-orientation": prop("orientation"),
      })
    },

    getItemIndicatorProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.itemIndicator.attrs,
        dir: prop("dir"),
        "aria-hidden": true,
        "data-state": itemState.expanded ? "open" : "closed",
        "data-disabled": dataAttr(itemState.disabled),
        "data-focus": dataAttr(itemState.focused),
        "data-orientation": prop("orientation"),
      })
    },

    getItemTriggerProps(props) {
      const { value } = props
      const itemState = getItemState(props)

      return normalize.button({
        ...parts.itemTrigger.attrs,
        type: "button",
        dir: prop("dir"),
        id: dom.getItemTriggerId(scope, value),
        "aria-controls": dom.getItemContentId(scope, value),
        "aria-expanded": itemState.expanded,
        disabled: itemState.disabled,
        "data-orientation": prop("orientation"),
        "aria-disabled": itemState.disabled,
        "data-state": itemState.expanded ? "open" : "closed",
        "data-ownedby": dom.getRootId(scope),
        onFocus() {
          if (itemState.disabled) return
          send({ type: "TRIGGER.FOCUS", value })
        },
        onBlur() {
          if (itemState.disabled) return
          send({ type: "TRIGGER.BLUR" })
        },
        onClick(event) {
          if (itemState.disabled) return
          if (isSafari()) {
            event.currentTarget.focus()
          }
          send({ type: "TRIGGER.CLICK", value })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (itemState.disabled) return

          const keyMap: EventKeyMap = {
            ArrowDown() {
              if (computed("isHorizontal")) return
              send({ type: "GOTO.NEXT", value })
            },
            ArrowUp() {
              if (computed("isHorizontal")) return
              send({ type: "GOTO.PREV", value })
            },
            ArrowRight() {
              if (!computed("isHorizontal")) return
              send({ type: "GOTO.NEXT", value })
            },
            ArrowLeft() {
              if (!computed("isHorizontal")) return
              send({ type: "GOTO.PREV", value })
            },
            Home() {
              send({ type: "GOTO.FIRST", value })
            },
            End() {
              send({ type: "GOTO.LAST", value })
            },
          }

          const key = getEventKey(event, {
            dir: prop("dir"),
            orientation: prop("orientation"),
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
