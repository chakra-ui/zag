import type { MachineContext, ItemProps, ItemState, MachineApi, MachineEvent, MachineInput } from "./accordion.types"
import { parts } from "./accordion.anatomy"
import { dom } from "./accordion.dom"
import { assertEvent, assign, setup, SnapshotFrom, and, not, EventFrom } from "xstate"
import { add, isEqual, remove, warn } from "@zag-js/utils"
import { getEventKey, type EventKeyMap } from "@zag-js/dom-event"
import { dataAttr, isSafari } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"

function coarseValue(context: MachineContext, value: string[]): string[] {
  if (!context.multiple && context.value.length > 1) {
    warn(`The value of accordion should be a single value when multiple is false.`)
    return [value[0]]
  }

  return value
}

export const accordionMachine = setup({
  types: {
    context: {} as MachineContext,
    input: {} as MachineInput,
    events: {} as MachineEvent,
  },
  actions: {
    setFocusedValue: assign({
      focusedValue: ({ context, event }) => {
        assertEvent(event, "TRIGGER.FOCUS")

        if (isEqual(context.focusedValue, event.value)) {
          return context.focusedValue
        }

        context.onFocusChange?.({ value: event.value })

        return event.value
      },
    }),
    focusNextTrigger: ({ context }) => {
      if (!context.focusedValue) return
      const triggerEl = dom.getNextTriggerEl(context, context.focusedValue)
      triggerEl?.focus()
    },
    focusPrevTrigger: ({ context }) => {
      if (!context.focusedValue) return
      const triggerEl = dom.getPrevTriggerEl(context, context.focusedValue)
      triggerEl?.focus()
    },
    collapse: assign({
      value: ({ context, event }) => {
        assertEvent(event, "TRIGGER.CLICK")

        const next = context.multiple ? remove(context.value, event.value) : []
        const nextCoarsed = coarseValue(context, context.multiple ? next : [])

        if (isEqual(context.value, nextCoarsed)) {
          return context.value
        }

        context.onValueChange?.({ value: nextCoarsed })

        return nextCoarsed
      },
    }),
    expand: assign({
      value: ({ context, event }) => {
        assertEvent(event, "TRIGGER.CLICK")

        const next = context.multiple ? add(context.value, event.value) : [event.value]
        const nextCoarsed = coarseValue(context, next)

        if (isEqual(context.value, nextCoarsed)) {
          return context.value
        }

        context.onValueChange?.({ value: nextCoarsed })

        return nextCoarsed
      },
    }),
    focusFirstTrigger: ({ context }) => {
      dom.getFirstTriggerEl(context)?.focus()
    },
    focusLastTrigger: ({ context }) => {
      dom.getLastTriggerEl(context)?.focus()
    },
    clearFocusedValue: assign({
      focusedValue: ({ context }) => {
        if (isEqual(context.focusedValue, null)) {
          return context.focusedValue
        }

        context.onFocusChange?.({ value: null })

        return null
      },
    }),
    setValue: assign({
      value: ({ context, event }) => {
        assertEvent(event, "VALUE.SET")

        const nextValue = coarseValue(context, event.value)
        if (isEqual(context.value, nextValue)) {
          return context.value
        }

        context.onValueChange?.({ value: nextValue })

        return nextValue
      },
    }),
    syncContext: assign(({ context, event }) => {
      assertEvent(event, "CONTEXT.SYNC")

      const mergedContext = Object.assign({}, context, event.updatedContext)

      const nextContext = Object.assign(mergedContext, {
        value: coarseValue(mergedContext, mergedContext.value),
      })

      if (!isEqual(context.value, nextContext.value)) {
        context.onValueChange?.({ value: nextContext.value })
      }

      return nextContext
    }),
  },
  guards: {
    isExpanded: ({ context, event }) => {
      assertEvent(event, "TRIGGER.CLICK")

      return context.value.includes(event.value)
    },
    canToggle: ({ context }) => !!context.collapsible || !!context.multiple,
  },
}).createMachine({
  id: "accordion",

  context: ({ input }) => {
    const initialContext: MachineContext = {
      focusedValue: null,
      value: [],
      collapsible: false,
      multiple: false,
      orientation: "vertical",
      ...input,
    }

    return {
      ...initialContext,
      value: coarseValue(initialContext, input.value ?? []),
    }
  },

  initial: "idle",

  on: {
    "VALUE.SET": {
      actions: "setValue",
    },
    "CONTEXT.SYNC": {
      actions: "syncContext",
    },
  },

  states: {
    idle: {
      on: {
        "TRIGGER.FOCUS": {
          target: "focused",
          actions: "setFocusedValue",
        },
      },
    },
    focused: {
      on: {
        "GOTO.NEXT": {
          actions: "focusNextTrigger",
        },
        "GOTO.PREV": {
          actions: "focusPrevTrigger",
        },
        "TRIGGER.CLICK": [
          {
            guard: and(["isExpanded", "canToggle"]),
            actions: [
              () => {
                console.log("collapse")
              },
              "collapse",
            ],
          },
          {
            guard: not("isExpanded"),
            actions: [
              () => {
                console.log("expand")
              },
              "expand",
            ],
          },
        ],
        "GOTO.FIRST": {
          actions: "focusFirstTrigger",
        },
        "GOTO.LAST": {
          actions: "focusLastTrigger",
        },
        "TRIGGER.BLUR": {
          target: "idle",
          actions: "clearFocusedValue",
        },
      },
    },
  },
})

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

export function accordionConnect<T extends PropTypes>(
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
