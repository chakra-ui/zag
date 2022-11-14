import { createMachine, guards } from "@zag-js/core"
import { getFocusables, nextTick, raf } from "@zag-js/dom-utils"
import { compact } from "@zag-js/utils"
import { dom } from "./tabs.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./tabs.types"

const { not } = guards

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      initial: "unknown",

      context: {
        dir: "ltr",
        orientation: "horizontal",
        activationMode: "automatic",
        value: null,
        focusedValue: null,
        previousValues: [],
        indicatorRect: { left: "0px", top: "0px", width: "0px", height: "0px" },
        hasMeasuredRect: false,
        isIndicatorRendered: false,
        loop: true,
        translations: {},
        ...ctx,
      },

      computed: {
        isHorizontal: (ctx) => ctx.orientation === "horizontal",
        isVertical: (ctx) => ctx.orientation === "vertical",
      },

      created: ["setPrevSelectedTabs"],

      watch: {
        focusedValue: "invokeOnFocus",
        value: ["invokeOnChange", "setPrevSelectedTabs", "setIndicatorRect", "setContentTabIndex"],
        dir: ["clearMeasured", "setIndicatorRect"],
      },

      on: {
        SET_VALUE: {
          actions: "setValue",
        },
        CLEAR_VALUE: {
          actions: "clearValue",
        },
      },

      states: {
        unknown: {
          on: {
            SETUP: {
              target: "idle",
              actions: ["checkRenderedElements", "setIndicatorRect", "setContentTabIndex"],
            },
          },
        },
        idle: {
          on: {
            TAB_FOCUS: {
              guard: "selectOnFocus",
              target: "focused",
              actions: ["setFocusedValue", "setValue"],
            },
            TAB_CLICK: {
              target: "focused",
              actions: ["setFocusedValue", "setValue"],
            },
          },
        },
        focused: {
          on: {
            TAB_CLICK: {
              target: "focused",
              actions: ["setFocusedValue", "setValue"],
            },
            ARROW_LEFT: {
              guard: "isHorizontal",
              actions: "focusPrevTab",
            },
            ARROW_RIGHT: {
              guard: "isHorizontal",
              actions: "focusNextTab",
            },
            ARROW_UP: {
              guard: "isVertical",
              actions: "focusPrevTab",
            },
            ARROW_DOWN: {
              guard: "isVertical",
              actions: "focusNextTab",
            },
            HOME: {
              actions: "focusFirstTab",
            },
            END: {
              actions: "focusLastTab",
            },
            ENTER: {
              guard: not("selectOnFocus"),
              actions: "setValue",
            },
            TAB_FOCUS: [
              {
                guard: "selectOnFocus",
                actions: ["setFocusedValue", "setValue"],
              },
              { actions: "setFocusedValue" },
            ],
            TAB_BLUR: {
              target: "idle",
              actions: "clearFocusedValue",
            },
          },
        },
      },
    },
    {
      guards: {
        isVertical: (ctx) => ctx.isVertical,
        isHorizontal: (ctx) => ctx.isHorizontal,
        selectOnFocus: (ctx) => ctx.activationMode === "automatic",
      },
      actions: {
        setFocusedValue(ctx, evt) {
          ctx.focusedValue = evt.value
        },
        clearFocusedValue(ctx) {
          ctx.focusedValue = null
        },
        setValue(ctx, evt) {
          ctx.value = evt.value
        },
        clearValue(ctx) {
          ctx.value = null
        },
        invokeOnDelete(ctx, evt) {
          ctx.onDelete?.({ value: evt.value })
        },
        focusFirstTab(ctx) {
          raf(() => dom.getFirstEl(ctx)?.focus())
        },
        focusLastTab(ctx) {
          raf(() => dom.getLastEl(ctx)?.focus())
        },
        focusNextTab(ctx) {
          if (!ctx.focusedValue) return
          const next = dom.getNextEl(ctx, ctx.focusedValue)
          raf(() => next?.focus())
        },
        focusPrevTab(ctx) {
          if (!ctx.focusedValue) return
          const prev = dom.getPrevEl(ctx, ctx.focusedValue)
          raf(() => prev?.focus())
        },
        setIndicatorRect(ctx) {
          nextTick(() => {
            if (!ctx.isIndicatorRendered || !ctx.value) return
            ctx.indicatorRect = dom.getRectById(ctx, ctx.value)
            if (ctx.hasMeasuredRect) return
            nextTick(() => {
              ctx.hasMeasuredRect = true
            })
          })
        },
        checkRenderedElements(ctx) {
          ctx.isIndicatorRendered = !!dom.getIndicatorEl(ctx)
        },
        clearMeasured(ctx) {
          ctx.hasMeasuredRect = false
        },
        invokeOnChange(ctx) {
          ctx.onChange?.({ value: ctx.value })
        },
        invokeOnFocus(ctx) {
          ctx.onFocus?.({ value: ctx.focusedValue })
        },
        setPrevSelectedTabs(ctx) {
          if (ctx.value != null) {
            ctx.previousValues = pushUnique(Array.from(ctx.previousValues), ctx.value)
          }
        },
        // if tab panel contains focusable elements, remove the tabindex attribute
        setContentTabIndex(ctx) {
          raf(() => {
            const panel = dom.getActiveContentEl(ctx)
            if (!panel) return
            const focusables = getFocusables(panel)
            if (focusables.length > 0) {
              panel.removeAttribute("tabindex")
            } else {
              panel.setAttribute("tabindex", "0")
            }
          })
        },
      },
    },
  )
}

// function to push value array and remove previous instances of value
function pushUnique(arr: any[], value: any) {
  const newArr = arr.slice()
  const index = newArr.indexOf(value)
  if (index > -1) {
    newArr.splice(index, 1)
  }
  newArr.push(value)
  return newArr
}
