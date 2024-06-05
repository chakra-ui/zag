import { getEventKey, type EventKeyMap } from "@zag-js/dom-event"
import { dataAttr, isSafari } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./accordion.anatomy"
import { dom } from "./accordion.dom"
import type { ItemProps, ItemState, MachineApi, Send, State } from "./accordion.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const focusedValue = state.context.focusedValue
  const value = state.context.value
  const multiple = state.context.multiple

  function setValue(value: string[]) {
    let nextValue = value
    if (multiple && nextValue.length > 1) {
      nextValue = [nextValue[0]]
    }
    send({ type: "VALUE.SET", value: nextValue })
  }

  function getItemState(props: ItemProps): ItemState {
    return {
      expanded: value.includes(props.value),
      focused: focusedValue === props.value,
      disabled: Boolean(props.disabled ?? state.context.disabled),
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
        dir: state.context.dir,
        id: dom.getRootId(state.context),
        "data-orientation": state.context.orientation,
      })
    },

    getItemProps(props: ItemProps) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.item.attrs,
        dir: state.context.dir,
        id: dom.getItemId(state.context, props.value),
        "data-state": itemState.expanded ? "open" : "closed",
        "data-focus": dataAttr(itemState.focused),
        "data-disabled": dataAttr(itemState.disabled),
        "data-orientation": state.context.orientation,
      })
    },

    getItemContentProps(props: ItemProps) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.itemContent.attrs,
        dir: state.context.dir,
        role: "region",
        id: dom.getItemContentId(state.context, props.value),
        "aria-labelledby": dom.getItemTriggerId(state.context, props.value),
        hidden: !itemState.expanded,
        "data-state": itemState.expanded ? "open" : "closed",
        "data-disabled": dataAttr(itemState.disabled),
        "data-focus": dataAttr(itemState.focused),
        "data-orientation": state.context.orientation,
      })
    },

    getItemIndicatorProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.itemIndicator.attrs,
        dir: state.context.dir,
        "aria-hidden": true,
        "data-state": itemState.expanded ? "open" : "closed",
        "data-disabled": dataAttr(itemState.disabled),
        "data-focus": dataAttr(itemState.focused),
        "data-orientation": state.context.orientation,
      })
    },

    getItemTriggerProps(props: ItemProps) {
      const { value } = props
      const itemState = getItemState(props)

      return normalize.button({
        ...parts.itemTrigger.attrs,
        type: "button",
        dir: state.context.dir,
        id: dom.getItemTriggerId(state.context, value),
        "aria-controls": dom.getItemContentId(state.context, value),
        "aria-expanded": itemState.expanded,
        disabled: itemState.disabled,
        "data-orientation": state.context.orientation,
        "aria-disabled": itemState.disabled,
        "data-state": itemState.expanded ? "open" : "closed",
        "data-ownedby": dom.getRootId(state.context),
        onFocus() {
          if (itemState.disabled) return
          send({ type: "TRIGGER.FOCUS", value })
        },
        onBlur() {
          if (itemState.disabled) return
          send("TRIGGER.BLUR")
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
              if (state.context.isHorizontal) return
              send({ type: "GOTO.NEXT", value })
            },
            ArrowUp() {
              if (state.context.isHorizontal) return
              send({ type: "GOTO.PREV", value })
            },
            ArrowRight() {
              if (!state.context.isHorizontal) return
              send({ type: "GOTO.NEXT", value })
            },
            ArrowLeft() {
              if (!state.context.isHorizontal) return
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
            dir: state.context.dir,
            orientation: state.context.orientation,
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
