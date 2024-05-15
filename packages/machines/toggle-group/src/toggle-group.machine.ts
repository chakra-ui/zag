import { createMachine, guards } from "@zag-js/core"
import { raf } from "@zag-js/dom-query"
import { add, compact, isEqual, remove } from "@zag-js/utils"
import { dom } from "./toggle-group.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./toggle-group.types"

const { not, and } = guards

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "toggle-group",
      initial: "idle",

      context: {
        value: [],
        disabled: false,
        orientation: "horizontal",
        rovingFocus: true,
        loopFocus: true,
        ...ctx,
        focusedId: null,
        isTabbingBackward: false,
        isClickFocus: false,
        isWithinToolbar: false,
      },

      computed: {
        currentLoopFocus: (ctx) => ctx.loopFocus && !ctx.isWithinToolbar,
      },

      entry: ["checkIfWithinToolbar"],

      on: {
        "VALUE.SET": {
          actions: ["setValue"],
        },
        "TOGGLE.CLICK": {
          actions: ["setValue"],
        },
        "ROOT.MOUSE_DOWN": {
          actions: ["setClickFocus"],
        },
      },

      states: {
        idle: {
          on: {
            "ROOT.FOCUS": {
              target: "focused",
              guard: not(and("isClickFocus", "isTabbingBackward")),
              actions: ["focusFirstToggle", "clearClickFocus"],
            },
            "TOGGLE.FOCUS": {
              target: "focused",
              actions: ["setFocusedId"],
            },
          },
        },

        focused: {
          on: {
            "ROOT.BLUR": {
              target: "idle",
              actions: ["clearIsTabbingBackward"],
            },
            "TOGGLE.FOCUS": {
              actions: ["setFocusedId"],
            },
            "TOGGLE.FOCUS_NEXT": {
              actions: ["focusNextToggle"],
            },
            "TOGGLE.FOCUS_PREV": {
              actions: ["focusPrevToggle"],
            },
            "TOGGLE.FOCUS_FIRST": {
              actions: ["focusFirstToggle"],
            },
            "TOGGLE.FOCUS_LAST": {
              actions: ["focusLastToggle"],
            },
            "TOGGLE.SHIFT_TAB": {
              target: "idle",
              actions: ["setIsTabbingBackward"],
            },
          },
        },
      },
    },
    {
      guards: {
        isClickFocus: (ctx) => ctx.isClickFocus,
        isTabbingBackward: (ctx) => ctx.isTabbingBackward,
      },
      actions: {
        setIsTabbingBackward(ctx) {
          ctx.isTabbingBackward = true
        },
        clearIsTabbingBackward(ctx) {
          ctx.isTabbingBackward = false
        },
        setClickFocus(ctx) {
          ctx.isClickFocus = true
        },
        clearClickFocus(ctx) {
          ctx.isClickFocus = false
        },
        checkIfWithinToolbar(ctx) {
          const closestToolbar = dom.getRootEl(ctx)?.closest("[role=toolbar]")
          ctx.isWithinToolbar = !!closestToolbar
        },
        setFocusedId(ctx, evt) {
          ctx.focusedId = evt.id
        },
        clearFocusedId(ctx) {
          ctx.focusedId = null
        },
        setValue(ctx, evt) {
          if (!evt.value) return
          let next = Array.from(ctx.value)
          if (ctx.multiple) {
            next = next.includes(evt.value) ? remove(next, evt.value) : add(next, evt.value)
          } else {
            next = isEqual(ctx.value, [evt.value]) ? [] : [evt.value]
          }
          set.value(ctx, next)
        },
        focusNextToggle(ctx) {
          raf(() => {
            if (!ctx.focusedId) return
            dom.getNextEl(ctx, ctx.focusedId)?.focus({ preventScroll: true })
          })
        },
        focusPrevToggle(ctx) {
          raf(() => {
            if (!ctx.focusedId) return
            dom.getPrevEl(ctx, ctx.focusedId)?.focus({ preventScroll: true })
          })
        },
        focusFirstToggle(ctx) {
          raf(() => {
            dom.getFirstEl(ctx)?.focus({ preventScroll: true })
          })
        },
        focusLastToggle(ctx) {
          raf(() => {
            dom.getLastEl(ctx)?.focus({ preventScroll: true })
          })
        },
      },
    },
  )
}

const invoke = {
  change(ctx: MachineContext) {
    ctx.onValueChange?.({ value: Array.from(ctx.value) })
  },
}

const set = {
  value(ctx: MachineContext, value: string[]) {
    if (isEqual(ctx.value, value)) return
    ctx.value = value
    invoke.change(ctx)
  },
}
