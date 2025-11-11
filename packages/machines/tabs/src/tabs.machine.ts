import { setup } from "@zag-js/core"
import { clickIfLink, getFocusables, isAnchorElement, raf, resizeObserverBorderBox } from "@zag-js/dom-query"
import type { Rect } from "@zag-js/types"
import * as dom from "./tabs.dom"
import type { TabsSchema } from "./tabs.types"

const { createMachine } = setup<TabsSchema>()

export const machine = createMachine({
  props({ props }) {
    return {
      dir: "ltr",
      orientation: "horizontal",
      activationMode: "automatic",
      loopFocus: true,
      composite: true,
      navigate(details) {
        clickIfLink(details.node)
      },
      defaultValue: null,
      ...props,
    }
  },

  initialState() {
    return "idle"
  },

  context({ prop, bindable }) {
    return {
      value: bindable(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        onChange(value) {
          prop("onValueChange")?.({ value: value! })
        },
      })),
      focusedValue: bindable(() => ({
        defaultValue: prop("value") || prop("defaultValue"),
        sync: true,
        onChange(value) {
          prop("onFocusChange")?.({ focusedValue: value! })
        },
      })),
      ssr: bindable(() => ({ defaultValue: true })),
      indicatorRect: bindable<Rect | null>(() => ({
        defaultValue: null,
      })),
    }
  },

  watch({ context, prop, track, action }) {
    track([() => context.get("value")], () => {
      action(["syncIndicatorRect", "syncTabIndex", "navigateIfNeeded"])
    })
    track([() => prop("dir"), () => prop("orientation")], () => {
      action(["syncIndicatorRect"])
    })
  },

  on: {
    SET_VALUE: {
      actions: ["setValue"],
    },
    CLEAR_VALUE: {
      actions: ["clearValue"],
    },
    SET_INDICATOR_RECT: {
      actions: ["setIndicatorRect"],
    },
    SYNC_TAB_INDEX: {
      actions: ["syncTabIndex"],
    },
  },

  entry: ["syncIndicatorRect", "syncTabIndex", "syncSsr"],

  exit: ["cleanupObserver"],

  states: {
    idle: {
      on: {
        TAB_FOCUS: {
          target: "focused",
          actions: ["setFocusedValue"],
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
          actions: ["setFocusedValue", "setValue"],
        },
        ARROW_PREV: [
          {
            guard: "selectOnFocus",
            actions: ["focusPrevTab", "selectFocusedTab"],
          },
          {
            actions: ["focusPrevTab"],
          },
        ],
        ARROW_NEXT: [
          {
            guard: "selectOnFocus",
            actions: ["focusNextTab", "selectFocusedTab"],
          },
          {
            actions: ["focusNextTab"],
          },
        ],
        HOME: [
          {
            guard: "selectOnFocus",
            actions: ["focusFirstTab", "selectFocusedTab"],
          },
          {
            actions: ["focusFirstTab"],
          },
        ],
        END: [
          {
            guard: "selectOnFocus",
            actions: ["focusLastTab", "selectFocusedTab"],
          },
          {
            actions: ["focusLastTab"],
          },
        ],
        TAB_FOCUS: {
          actions: ["setFocusedValue"],
        },
        TAB_BLUR: {
          target: "idle",
          actions: ["clearFocusedValue"],
        },
      },
    },
  },

  implementations: {
    guards: {
      selectOnFocus: ({ prop }) => prop("activationMode") === "automatic",
    },

    actions: {
      selectFocusedTab({ context, prop }) {
        raf(() => {
          const focusedValue = context.get("focusedValue")
          if (!focusedValue) return
          const nullable = prop("deselectable") && context.get("value") === focusedValue
          const value = nullable ? null : focusedValue
          context.set("value", value)
        })
      },
      setFocusedValue({ context, event, flush }) {
        if (event.value == null) return
        flush(() => {
          context.set("focusedValue", event.value)
        })
      },
      clearFocusedValue({ context }) {
        context.set("focusedValue", null)
      },
      setValue({ context, event, prop }) {
        const nullable = prop("deselectable") && context.get("value") === context.get("focusedValue")
        context.set("value", nullable ? null : event.value)
      },
      clearValue({ context }) {
        context.set("value", null)
      },

      focusFirstTab({ scope }) {
        raf(() => {
          dom.getFirstTriggerEl(scope)?.focus()
        })
      },

      focusLastTab({ scope }) {
        raf(() => {
          dom.getLastTriggerEl(scope)?.focus()
        })
      },

      focusNextTab({ context, prop, scope, event }) {
        const focusedValue = event.value ?? context.get("focusedValue")
        if (!focusedValue) return

        const triggerEl = dom.getNextTriggerEl(scope, {
          value: focusedValue,
          loopFocus: prop("loopFocus"),
        })

        raf(() => {
          if (prop("composite")) {
            triggerEl?.focus()
          } else if (triggerEl?.dataset.value != null) {
            context.set("focusedValue", triggerEl.dataset.value)
          }
        })
      },

      focusPrevTab({ context, prop, scope, event }) {
        const focusedValue = event.value ?? context.get("focusedValue")
        if (!focusedValue) return

        const triggerEl = dom.getPrevTriggerEl(scope, {
          value: focusedValue,
          loopFocus: prop("loopFocus"),
        })

        raf(() => {
          if (prop("composite")) {
            triggerEl?.focus()
          } else if (triggerEl?.dataset.value != null) {
            context.set("focusedValue", triggerEl.dataset.value)
          }
        })
      },

      syncTabIndex({ context, scope }) {
        raf(() => {
          const value = context.get("value")
          if (!value) return

          const contentEl = dom.getContentEl(scope, value)
          if (!contentEl) return

          const focusables = getFocusables(contentEl)
          if (focusables.length > 0) {
            contentEl.removeAttribute("tabindex")
          } else {
            contentEl.setAttribute("tabindex", "0")
          }
        })
      },
      cleanupObserver({ refs }) {
        const cleanup = refs.get("indicatorCleanup")
        if (cleanup) cleanup()
      },
      setIndicatorRect({ context, event, scope }) {
        const value = event.id ?? context.get("value")

        const indicatorEl = dom.getIndicatorEl(scope)
        if (!indicatorEl) return

        if (!value) return

        const triggerEl = dom.getTriggerEl(scope, value)
        if (!triggerEl) return

        context.set("indicatorRect", dom.getRectByValue(scope, value))
      },
      syncSsr({ context }) {
        context.set("ssr", false)
      },
      syncIndicatorRect({ context, refs, scope }) {
        const cleanup = refs.get("indicatorCleanup")
        if (cleanup) cleanup()

        const value = context.get("value")
        if (!value) return

        const triggerEl = dom.getTriggerEl(scope, value)
        const indicatorEl = dom.getIndicatorEl(scope)
        if (!triggerEl || !indicatorEl) return

        const exec = () => {
          context.set("indicatorRect", dom.getOffsetRect(triggerEl))
        }
        exec()
        const indicatorCleanup = resizeObserverBorderBox.observe(triggerEl, exec)

        refs.set("indicatorCleanup", indicatorCleanup)
      },
      navigateIfNeeded({ context, prop, scope }) {
        const value = context.get("value")
        if (!value) return

        const triggerEl = dom.getTriggerEl(scope, value)
        if (isAnchorElement(triggerEl)) {
          prop("navigate")?.({ value, node: triggerEl, href: triggerEl.href })
        }
      },
    },
  },
})
