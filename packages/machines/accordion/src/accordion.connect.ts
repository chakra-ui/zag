import { getEventKey, type EventKeyMap } from "@zag-js/dom-event"
import { dataAttr, isSafari } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./accordion.anatomy"
import { dom } from "./accordion.dom"
import { createReducer } from "./accordion.reducer"
import type { ItemProps, PublicApi, Send, State } from "./accordion.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): PublicApi<T> {
  const reducer = createReducer(state, send)

  return {
    ...reducer,

    rootProps: normalize.element({
      ...parts.root.attrs,
      id: dom.getRootId(state.context),
    }),

    getItemProps(props: ItemProps) {
      const { isOpen, isFocused } = reducer.getItemState(props)
      return normalize.element({
        ...parts.item.attrs,
        id: dom.getItemId(state.context, props.value),
        "data-expanded": dataAttr(isOpen),
        "data-focus": dataAttr(isFocused),
      })
    },

    getContentProps(props: ItemProps) {
      const { isOpen, isFocused, isDisabled } = reducer.getItemState(props)
      return normalize.element({
        ...parts.content.attrs,
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
      const itemState = reducer.getItemState(props)

      return normalize.button({
        ...parts.trigger.attrs,
        type: "button",
        id: dom.getTriggerId(state.context, value),
        "aria-controls": dom.getContentId(state.context, value),
        "aria-expanded": itemState.isOpen,
        disabled: itemState.isDisabled,
        "aria-disabled": itemState.isDisabled,
        "data-expanded": dataAttr(itemState.isOpen),
        "data-ownedby": dom.getRootId(state.context),
        onFocus() {
          if (itemState.isDisabled) return
          send({ type: "TRIGGER.FOCUS", value })
        },
        onBlur() {
          if (itemState.isDisabled) return
          send("TRIGGER.BLUR")
        },
        onClick(event) {
          if (itemState.isDisabled) return
          if (isSafari()) {
            event.currentTarget.focus()
          }
          send({ type: "TRIGGER.CLICK", value })
        },
        onKeyDown(event) {
          if (itemState.isDisabled) return

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
