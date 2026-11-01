import { createGuards, createMachine } from "@zag-js/core"
import { addDomEvent, getEventTarget, raf } from "@zag-js/dom-query"
import { add, remove, warn } from "@zag-js/utils"
import { parts } from "./accordion.anatomy"
import * as dom from "./accordion.dom"
import type { AccordionSchema } from "./accordion.types"

const { and, not } = createGuards<AccordionSchema>()

export const machine = createMachine<AccordionSchema>({
  props({ props }) {
    return {
      collapsible: true,
      multiple: false,
      orientation: "vertical",
      defaultValue: [],
      ...props,
    }
  },

  initialState() {
    return "idle"
  },

  context({ prop, bindable }) {
    return {
      focusedValue: bindable<string | null>(() => ({
        defaultValue: null,
        sync: true,
        onChange(value) {
          prop("onFocusChange")?.({ value })
        },
      })),
      value: bindable<string[]>(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        hash: (value) => value.join(","),
        onChange(value) {
          prop("onValueChange")?.({ value })
        },
      })),
    }
  },

  watch({ track, context, prop, action }) {
    track([() => context.hash("value"), () => prop("hiddenUntilFound")], () => {
      action(["syncHiddenUntilFound"])
    })
  },

  effects: ["trackBeforeMatch"],

  on: {
    "VALUE.SET": {
      actions: ["setValue"],
    },
    "ITEM.MATCH": {
      guard: not("isExpanded"),
      actions: ["expand"],
    },
  },

  states: {
    idle: {
      on: {
        "TRIGGER.FOCUS": {
          target: "focused",
          actions: ["setFocusedValue"],
        },
      },
    },
    focused: {
      on: {
        "TRIGGER.CLICK": [
          {
            guard: and("isExpanded", "canToggle"),
            actions: ["collapse"],
          },
          {
            guard: not("isExpanded"),
            actions: ["expand"],
          },
        ],
        "TRIGGER.BLUR": {
          target: "idle",
          actions: ["clearFocusedValue"],
        },
      },
    },
  },

  implementations: {
    effects: {
      trackBeforeMatch({ scope, prop, context, send }) {
        if (!prop("hiddenUntilFound")) return

        const timers = new Set<ReturnType<typeof setTimeout>>()
        const frames = new Set<VoidFunction>()

        const frameCleanup = raf(() => {
          dom.syncHiddenUntilFound(scope)

          const rootEl = dom.getRootEl(scope)
          if (!rootEl) return

          // Capture: one root listener covers every item, even if the event doesn't bubble
          const onBeforeMatch = (event: Event) => {
            const contentEl = getEventTarget<HTMLElement>(event)
            // Ignore nested accordions
            if (!contentEl || contentEl.getAttribute(parts.itemContent.attr) !== scope.id) return

            const value = contentEl.dataset.value
            const disabled = contentEl.hasAttribute("data-disabled")
            if (value != null && !disabled) send({ type: "ITEM.MATCH", value })

            // Re-hide if it didn't expand (disabled or ignored controlled value)
            const timer = setTimeout(() => {
              timers.delete(timer)
              const frame = raf(() => {
                frames.delete(frame)
                if (value != null && context.get("value").includes(value)) return
                contentEl.setAttribute("hidden", "until-found")
              })
              frames.add(frame)
            })
            timers.add(timer)
          }

          return addDomEvent(rootEl, "beforematch", onBeforeMatch, true)
        })

        return () => {
          frameCleanup()
          timers.forEach(clearTimeout)
          frames.forEach((cleanup) => cleanup())
        }
      },
    },

    guards: {
      canToggle: ({ prop }) => !!prop("collapsible") || !!prop("multiple"),
      isExpanded: ({ context, event }) => context.get("value").includes(event.value),
    },

    actions: {
      collapse({ context, prop, event }) {
        const next = prop("multiple") ? remove<string>(context.get("value"), event.value) : []
        context.set("value", next)
      },
      expand({ context, prop, event }) {
        const next = prop("multiple") ? add<string>(context.get("value"), event.value) : [event.value]
        context.set("value", next)
      },
      setFocusedValue({ context, event }) {
        context.set("focusedValue", event.value)
      },
      clearFocusedValue({ context }) {
        context.set("focusedValue", null)
      },
      setValue({ context, event }) {
        context.set("value", event.value)
      },
      syncHiddenUntilFound({ scope, prop }) {
        if (!prop("hiddenUntilFound")) return
        raf(() => dom.syncHiddenUntilFound(scope))
      },
      coarseValue({ context, prop }) {
        if (!prop("multiple") && context.get("value").length > 1) {
          warn(`The value of accordion should be a single value when multiple is false.`)
          context.set("value", [context.get("value")[0]])
        }
      },
    },
  },
})
