import type { MachineContext, ItemProps, ItemState, MachineApi } from "@zag-js/accordion/src/accordion.types"
import { parts } from "@zag-js/accordion/src//accordion.anatomy"
import { dom } from "@zag-js/accordion/src/accordion.dom"
import { normalizeProps } from "@zag-js/react"
import { accordionControls, accordionData } from "@zag-js/shared"
import { useEffect, useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"
import { assertEvent, assign, setup, SnapshotFrom, and, not, EventFrom } from "xstate"
import { useActor } from "@xstate/react"
import { add, remove, warn } from "@zag-js/utils"
import { getEventKey, type EventKeyMap } from "@zag-js/dom-event"
import { dataAttr, isSafari } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"

/**
 * Todo:
 *
 * - [x] Make isHorizontal a computed property
 * - [ ] Call invoke.change and invoke.focusChange when value or focusedValue change
 * - [ ] Reimplement coarseValue (instead, call when assigning to the context? More code to write)
 *   - [x] Call for initial context
 *   - [ ] Call when value changes
 *   - [ ] Call when multiple changes
 */

type AccordionMachineContext = Omit<MachineContext, "isHorizontal">
type AccordionMachineInput = Omit<Partial<MachineContext>, "isHorizontal"> & { id: string }

function coarseValue(context: AccordionMachineContext, value: string[]): string[] {
  if (!context.multiple && context.value.length > 1) {
    warn(`The value of accordion should be a single value when multiple is false.`)
    return [value[0]]
  }

  return value
}

const accordionMachine = setup({
  types: {
    context: {} as AccordionMachineContext,
    input: {} as AccordionMachineInput,
    events: {} as
      | { type: "CONTEXT.SYNC"; updatedContext: Omit<AccordionMachineInput, "id"> }
      | { type: "TRIGGER.FOCUS"; value: string }
      | { type: "GOTO.NEXT" }
      | { type: "GOTO.PREV" }
      | { type: "TRIGGER.CLICK"; value: string }
      | { type: "GOTO.FIRST" }
      | { type: "GOTO.LAST" }
      | { type: "TRIGGER.BLUR" }
      | { type: "VALUE.SET"; value: string[] },
  },
  actions: {
    setFocusedValue: assign({
      focusedValue: ({ event }) => {
        assertEvent(event, "TRIGGER.FOCUS")

        return event.value
      },
    }),
    focusNextTrigger: ({ context }) => {
      if (!context.focusedValue) return
      const contextFakelyAugmented = context as typeof context & { isHorizontal: boolean }
      const triggerEl = dom.getNextTriggerEl(contextFakelyAugmented, context.focusedValue)
      triggerEl?.focus()
    },
    focusPrevTrigger: ({ context }) => {
      if (!context.focusedValue) return
      const contextFakelyAugmented = context as typeof context & { isHorizontal: boolean }
      const triggerEl = dom.getPrevTriggerEl(contextFakelyAugmented, context.focusedValue)
      triggerEl?.focus()
    },
    collapse: assign({
      value: ({ context, event }) => {
        assertEvent(event, "TRIGGER.CLICK")

        const next = context.multiple ? remove(context.value, event.value) : []
        return coarseValue(context, context.multiple ? next : [])
      },
    }),
    expand: assign({
      value: ({ context, event }) => {
        assertEvent(event, "TRIGGER.CLICK")

        const next = context.multiple ? add(context.value, event.value) : [event.value]
        return coarseValue(context, next)
      },
    }),
    focusFirstTrigger: ({ context }) => {
      const contextFakelyAugmented = context as typeof context & { isHorizontal: boolean }
      dom.getFirstTriggerEl(contextFakelyAugmented)?.focus()
    },
    focusLastTrigger: ({ context }) => {
      const contextFakelyAugmented = context as typeof context & { isHorizontal: boolean }
      dom.getLastTriggerEl(contextFakelyAugmented)?.focus()
    },
    clearFocusedValue: assign({
      focusedValue: null,
    }),
    setValue: assign({
      value: ({ context, event }) => {
        assertEvent(event, "VALUE.SET")

        return coarseValue(context, event.value)
      },
    }),
    syncContext: assign(({ context, event }) => {
      assertEvent(event, "CONTEXT.SYNC")

      const mergedContext = Object.assign({}, context, event.updatedContext)

      return Object.assign(mergedContext, {
        value: coarseValue(mergedContext, mergedContext.value),
      })
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
    const initialContext: AccordionMachineContext = {
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

function accordionConnect<T extends PropTypes>(
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

export default function Page() {
  const controls = useControls(accordionControls)

  const [state, send] = useActor(accordionMachine, { input: { ...controls.context, id: useId() } })

  useEffect(() => {
    send({ type: "CONTEXT.SYNC", updatedContext: controls.context })
  }, [controls.context, send])

  console.log(state)

  const api = accordionConnect(state, send, normalizeProps)

  return (
    <>
      <main className="accordion">
        <div {...api.rootProps}>
          {accordionData.map((item) => (
            <div key={item.id} {...api.getItemProps({ value: item.id })}>
              <h3>
                <button data-testid={`${item.id}:trigger`} {...api.getItemTriggerProps({ value: item.id })}>
                  {item.label}
                  <div {...api.getItemIndicatorProps({ value: item.id })}>{">"}</div>
                </button>
              </h3>
              <div data-testid={`${item.id}:content`} {...api.getItemContentProps({ value: item.id })}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </div>
            </div>
          ))}
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
