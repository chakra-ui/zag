import { setup } from "@zag-js/core"
import { AnimationFrame, getFocusables, isAnchorElement, raf, resizeObserverBorderBox } from "@zag-js/dom-query"
import type { Rect } from "@zag-js/types"
import { callAll, isEqual } from "@zag-js/utils"
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
          prop("onValueChange")?.({ value })
        },
      })),
      focusedValue: bindable(() => ({
        defaultValue: prop("value") || prop("defaultValue"),
        sync: true,
        onChange(value) {
          prop("onFocusChange")?.({ focusedValue: value })
        },
      })),
      ssr: bindable(() => ({ defaultValue: true })),
      indicatorRect: bindable<Rect | null>(() => ({
        defaultValue: null,
      })),
      indicatorInstant: bindable<boolean>(() => ({
        defaultValue: false,
      })),
    }
  },

  refs() {
    return {
      indicatorCleanup: null,
      indicatorFrame: AnimationFrame.create(),
      focusFrame: AnimationFrame.create(),
    }
  },

  watch({ context, prop, track, action }) {
    track([() => context.get("value")], () => {
      action(["syncIndicatorRect", "syncTabIndex"])
    })
    track([() => prop("dir"), () => prop("orientation")], () => {
      action(["snapIndicator", "syncIndicatorRect"])
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
    INDICATOR_RESIZE: [
      // A running selection transition retargets to the new rect instead of snapping
      { guard: "isIndicatorTransitioning", actions: ["setResizedIndicatorRect"] },
      { actions: ["snapIndicator", "setResizedIndicatorRect"] },
    ],
  },

  entry: ["syncIndicatorRect", "syncTabIndex", "syncSsr"],

  exit: ["cleanupObserver", "cancelFocusFrame", "cancelIndicatorFrame"],

  states: {
    idle: {
      on: {
        TAB_FOCUS: {
          target: "focused",
          actions: ["setFocusedValue"],
        },
        TAB_CLICK: {
          target: "focused",
          actions: ["setFocusedValue", "setValue", "requestNavigation"],
        },
      },
    },
    focused: {
      exit: ["cancelFocusFrame"],
      on: {
        TAB_CLICK: {
          actions: ["setFocusedValue", "setValue", "requestNavigation"],
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
      isIndicatorTransitioning: ({ event }) => !!event.transitioning,
    },

    actions: {
      selectFocusedTab({ context, prop, event, scope }) {
        raf(() => {
          const focusedValue = context.get("focusedValue")
          if (!focusedValue) return
          const nullable = prop("deselectable") && context.get("value") === focusedValue
          const value = nullable ? null : focusedValue
          if (context.get("value") === value) return

          if (event.src === "keyboard") {
            const triggerEl = dom.getTriggerEl(scope, focusedValue)
            if (isAnchorElement(triggerEl) && prop("navigate") !== null) {
              triggerEl.click()
              return
            }
          }

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

      focusFirstTab({ scope, refs }) {
        refs.get("focusFrame").request(() => {
          dom.getFirstTriggerEl(scope)?.focus()
        })
      },

      focusLastTab({ scope, refs }) {
        refs.get("focusFrame").request(() => {
          dom.getLastTriggerEl(scope)?.focus()
        })
      },

      focusNextTab({ context, prop, scope, event, refs }) {
        const focusedValue = event.value ?? context.get("focusedValue")
        if (!focusedValue) return

        const triggerEl = dom.getNextTriggerEl(scope, {
          value: focusedValue,
          loopFocus: prop("loopFocus"),
        })

        refs.get("focusFrame").request(() => {
          if (prop("virtualFocus")) {
            if (triggerEl?.dataset.value != null) {
              context.set("focusedValue", triggerEl.dataset.value)
            }
          } else {
            triggerEl?.focus()
          }
        })
      },

      focusPrevTab({ context, prop, scope, event, refs }) {
        const focusedValue = event.value ?? context.get("focusedValue")
        if (!focusedValue) return

        const triggerEl = dom.getPrevTriggerEl(scope, {
          value: focusedValue,
          loopFocus: prop("loopFocus"),
        })

        refs.get("focusFrame").request(() => {
          if (prop("virtualFocus")) {
            if (triggerEl?.dataset.value != null) {
              context.set("focusedValue", triggerEl.dataset.value)
            }
          } else {
            triggerEl?.focus()
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
      cancelFocusFrame({ refs }) {
        refs.get("focusFrame").cancel()
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
      snapIndicator({ context, refs }) {
        // Clear after two frames so the style recalc always sees `data-instant`
        const frame = refs.get("indicatorFrame")
        context.set("indicatorInstant", true)
        frame.request(() => frame.request(() => context.set("indicatorInstant", false)))
      },
      cancelIndicatorFrame({ refs }) {
        refs.get("indicatorFrame").cancel()
      },
      setResizedIndicatorRect({ context, event }) {
        context.set("indicatorRect", event.rect)
      },
      syncIndicatorRect({ context, refs, scope, send }) {
        const cleanup = refs.get("indicatorCleanup")
        if (cleanup) cleanup()

        const indicatorEl = dom.getIndicatorEl(scope)
        if (!indicatorEl) return

        const getRect = () => {
          const triggerEl = dom.getTriggerEl(scope, context.get("value"))
          return triggerEl ? dom.getOffsetRect(triggerEl) : null
        }

        const rect = getRect()
        if (rect) context.set("indicatorRect", (prev) => (isEqual(prev, rect) ? prev : rect))

        // Observers fire once on observe; only report real changes
        const onResize = () => {
          const rect = getRect()
          if (!rect || isEqual(context.get("indicatorRect"), rect)) return
          send({ type: "INDICATOR_RESIZE", rect, transitioning: indicatorEl.getAnimations?.().length > 0 })
        }

        const triggerEls = dom.getElements(scope)
        const listEl = dom.getListEl(scope)
        const indicatorCleanup = callAll(
          ...triggerEls.map((el) => resizeObserverBorderBox.observe(el, onResize)),
          ...(listEl ? [resizeObserverBorderBox.observe(listEl, onResize)] : []),
        )

        refs.set("indicatorCleanup", indicatorCleanup)
      },
      requestNavigation({ event, prop, scope }) {
        const navigate = prop("navigate")
        if (!navigate || event.value == null) return

        const node = dom.getTriggerEl(scope, event.value)
        if (!isAnchorElement(node)) return

        navigate({ value: event.value, node, href: node.href })
      },
    },
  },
})
