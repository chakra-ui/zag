import { createMachine } from "@zag-js/core"
import { compact } from "@zag-js/utils"
import type { MachineContext, MachineState, UserDefinedContext } from "./navigation-menu.types"
import { raf } from "@zag-js/dom-query"
import { dom } from "./navigation-menu.dom"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "navigation-menu",
      initial: "idle",
      context: {
        viewportRect: null,
        isViewportRendered: false,
        activeTriggerRect: null,
        value: null,
        previousValue: null,
        openDelay: 200,
        closeDelay: 300,
        orientation: "horizontal",
        ...ctx,
      },

      states: {
        idle: {
          on: {
            "trigger.enter": {
              target: "opening",
            },
          },
        },

        opening: {
          after: {
            OPEN_DELAY: {
              target: "open",
              actions: ["setValue"],
            },
          },
        },

        closing: {
          tags: ["open"],
          activities: ["trackViewportRect", "trackActiveTriggerRect"],
          on: {
            "content.enter": {
              target: "open",
            },
          },
        },

        open: {
          tags: ["open"],
          activities: ["trackViewportRect", "trackActiveTriggerRect"],
          on: {
            "content.leave": {
              target: "closing",
            },
          },
        },
      },
    },
    {
      guards: {},
      delays: {
        OPEN_DELAY: (ctx) => ctx.openDelay,
        CLOSE_DELAY: (ctx) => ctx.closeDelay,
      },
      actions: {
        clearValue(ctx) {
          ctx.previousValue = ctx.value
          ctx.value = null
        },
        setValue(ctx, evt) {
          ctx.previousValue = ctx.value
          ctx.value = evt.value
        },
        focusTrigger(ctx, evt) {
          raf(() => {
            dom.getTriggerEl(ctx, evt.value)?.focus({ preventScroll: true })
          })
        },
      },
    },
  )
}

// call this when value changes
// if null set to previous motion attribute
// if not null, set to current motion attribute
function getMotionAttribute(ctx: MachineContext) {
  const triggers = dom.getTriggerEls(ctx)

  let values = triggers.map((trigger) => trigger.getAttribute("data-value"))
  if (ctx.dir === "rtl") values.reverse()

  const index = values.indexOf(ctx.value)
  const prevIndex = values.indexOf(ctx.previousValue)
  const isSelected = ctx.value === ctx.value
  const wasSelected = prevIndex === values.indexOf(ctx.value)

  if (!isSelected && !wasSelected) return null

  // Don't provide a direction on the initial open
  if (index !== prevIndex) {
    // If we're moving to this item from another
    if (isSelected && prevIndex !== -1) return index > prevIndex ? "from-end" : "from-start"
    // If we're leaving this item for another
    if (wasSelected && index !== -1) return index > prevIndex ? "to-start" : "to-end"
  }

  // Otherwise we're entering from closed or leaving the list
  // entirely and should not animate in any direction
  return null
}
