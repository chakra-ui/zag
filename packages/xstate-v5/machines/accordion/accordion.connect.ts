import type { ItemProps, ItemState, MachineApi } from "./accordion.types"
import { parts } from "./accordion.anatomy"
import { dom } from "./accordion.dom"
import { SnapshotFrom, EventFrom } from "xstate"
import { getEventKey, type EventKeyMap } from "@zag-js/dom-event"
import { dataAttr, isSafari } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { accordionMachine } from "./accordion.machine"

const computed = {
  isHorizontal(state: SnapshotFrom<typeof accordionMachine>) {
    return state.context.orientation === "horizontal"
  },
}

type ResolvedComputedContext = { [key in keyof typeof computed]: ReturnType<(typeof computed)[key]> }

function getComputedContext(state: SnapshotFrom<typeof accordionMachine>): ResolvedComputedContext {
  const resolvedContext: ResolvedComputedContext = Object.create(null)

  for (const [key, fn] of Object.entries(computed)) {
    resolvedContext[key] = fn(state)
  }

  return resolvedContext
}

export function connect<T extends PropTypes>(
  state: SnapshotFrom<typeof accordionMachine>,
  send: (event: EventFrom<typeof accordionMachine>) => void,
  normalize: NormalizeProps<T>,
): MachineApi<T> {
  const context = Object.assign({}, state.context, getComputedContext(state))

  const focusedValue = context.focusedValue
  const value = context.value

  function setValue(value: string[]) {
    send({ type: "VALUE.SET", value })
  }

  function getItemState(props: ItemProps): ItemState {
    return {
      isOpen: value.includes(props.value),
      isFocused: focusedValue === props.value,
      isDisabled: Boolean(props.disabled ?? context.disabled),
    }
  }

  return {
    focusedValue,
    value,
    setValue,
    getItemState,

    rootProps: normalize.element({
      ...parts.root.attrs,
      dir: context.dir,
      id: dom.getRootId(context),
      "data-orientation": context.orientation,
    }),

    getItemProps(props: ItemProps) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.item.attrs,
        dir: context.dir,
        id: dom.getItemId(context, props.value),
        "data-state": itemState.isOpen ? "open" : "closed",
        "data-focus": dataAttr(itemState.isFocused),
        "data-disabled": dataAttr(itemState.isDisabled),
        "data-orientation": context.orientation,
      })
    },

    getItemContentProps(props: ItemProps) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.itemContent.attrs,
        dir: context.dir,
        role: "region",
        id: dom.getItemContentId(context, props.value),
        "aria-labelledby": dom.getItemTriggerId(context, props.value),
        hidden: !itemState.isOpen,
        "data-state": itemState.isOpen ? "open" : "closed",
        "data-disabled": dataAttr(itemState.isDisabled),
        "data-focus": dataAttr(itemState.isFocused),
        "data-orientation": context.orientation,
      })
    },

    getItemIndicatorProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.itemIndicator.attrs,
        dir: context.dir,
        "aria-hidden": true,
        "data-state": itemState.isOpen ? "open" : "closed",
        "data-disabled": dataAttr(itemState.isDisabled),
        "data-focus": dataAttr(itemState.isFocused),
        "data-orientation": context.orientation,
      })
    },

    getItemTriggerProps(props: ItemProps) {
      const { value } = props
      const itemState = getItemState(props)

      return normalize.button({
        ...parts.itemTrigger.attrs,
        type: "button",
        dir: context.dir,
        id: dom.getItemTriggerId(context, value),
        "aria-controls": dom.getItemContentId(context, value),
        "aria-expanded": itemState.isOpen,
        disabled: itemState.isDisabled,
        "data-orientation": context.orientation,
        "aria-disabled": itemState.isDisabled,
        "data-state": itemState.isOpen ? "open" : "closed",
        "data-ownedby": dom.getRootId(context),
        onFocus() {
          if (itemState.isDisabled) return
          send({ type: "TRIGGER.FOCUS", value })
        },
        onBlur() {
          if (itemState.isDisabled) return
          send({ type: "TRIGGER.BLUR" })
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
              if (context.isHorizontal) return
              send({ type: "GOTO.NEXT" })
            },
            ArrowUp() {
              if (context.isHorizontal) return
              send({ type: "GOTO.PREV" })
            },
            ArrowRight() {
              if (!context.isHorizontal) return
              send({ type: "GOTO.NEXT" })
            },
            ArrowLeft() {
              if (!context.isHorizontal) return
              send({ type: "GOTO.PREV" })
            },
            Home() {
              send({ type: "GOTO.FIRST" })
            },
            End() {
              send({ type: "GOTO.LAST" })
            },
          }

          const key = getEventKey(event, {
            dir: context.dir,
            orientation: context.orientation,
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
