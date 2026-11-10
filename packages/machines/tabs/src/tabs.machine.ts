import { setup } from "@zag-js/core"
import {
  addDomEvent,
  AnimationFrame,
  getFocusables,
  isAnchorElement,
  observeChildren,
  resizeObserverBorderBox,
} from "@zag-js/dom-query"
import type { Rect } from "@zag-js/types"
import { callAll, isEqual } from "@zag-js/utils"
import * as dom from "./tabs.dom"
import type { Params } from "@zag-js/core"
import type { ActivationDirection } from "@zag-js/types"
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

  context({ prop, bindable, scope }) {
    return {
      value: bindable(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        onChange(value, prevValue) {
          const activationDirection = dom.getActivationDirection(scope, prevValue ?? null, value, prop("orientation"))
          prop("onValueChange")?.({ value, activationDirection })
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
      tabStopValue: bindable<string | null>(() => ({
        defaultValue: null,
      })),
      hasFocusableContent: bindable<boolean>(() => ({
        defaultValue: false,
      })),
      activationDirection: bindable<ActivationDirection>(() => ({
        defaultValue: "none",
      })),
    }
  },

  refs({ prop }) {
    return {
      previousValue: prop("value") ?? prop("defaultValue") ?? null,
      indicatorCleanup: null,
      indicatorFrame: AnimationFrame.create(),
      focusFrame: AnimationFrame.create(),
      selectFrame: AnimationFrame.create(),
      tabIndexFrame: AnimationFrame.create(),
      directionFrame: AnimationFrame.create(),
    }
  },

  // Measured during render so panels see the direction on their first frame
  computed: {
    activationDirection({ context, refs, scope, prop }) {
      const value = context.get("value")
      const previousValue = refs.get("previousValue")
      if (value === previousValue) return context.get("activationDirection")
      return dom.getActivationDirection(scope, previousValue, value, prop("orientation"))
    },
  },

  watch({ context, prop, track, action }) {
    track([() => context.get("value")], () => {
      action(["setActivationDirection", "syncIndicatorRect", "syncTabIndex", "syncTabStopValue"])
    })
    track([() => prop("dir"), () => prop("orientation")], () => {
      action(["snapIndicator", "syncIndicatorRect"])
    })
  },

  on: {
    "TRIGGER.FOCUS": {
      target: "focused",
      actions: ["setFocusedValue"],
    },
    "TRIGGER.CLICK": {
      target: "focused",
      actions: ["setFocusedValue", "toggleValue", "requestNavigation"],
    },
    "TRIGGERS.CHANGE": {
      actions: ["syncTabStopValue", "syncIndicatorRect"],
    },
    "VALUE.SET": {
      actions: ["setValue"],
    },
    "VALUE.STEP": [{ guard: "isVirtualFocus", target: "focused", actions: ["stepValue"] }, { actions: ["stepValue"] }],
    "INDICATOR.SET": {
      actions: ["setIndicatorRect"],
    },
    "INDICATOR.RESIZE": [
      // A running selection transition retargets to the new rect instead of snapping
      {
        guard: "isIndicatorTransitioning",
        actions: ["setResizedIndicatorRect"],
      },
      { actions: ["snapIndicator", "setResizedIndicatorRect"] },
    ],
    "CONTENT.SYNC": {
      actions: ["syncTabIndex"],
    },
  },

  effects: ["trackTriggers"],

  entry: ["syncIndicatorRect", "syncTabIndex", "syncTabStopValue", "syncSsr"],

  exit: ["cleanupObserver", "cancelFrames"],

  states: {
    idle: {},
    focused: {
      exit: ["cancelFocusFrame"],
      on: {
        "FOCUS.MOVE": [
          {
            guard: "selectOnFocus",
            actions: ["moveFocus", "selectFocusedTab"],
          },
          { actions: ["moveFocus"] },
        ],
        "TRIGGER.BLUR": {
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
      isVirtualFocus: ({ prop }) => !!prop("virtualFocus"),
    },

    actions: {
      selectFocusedTab({ context, prop, event, scope, refs }) {
        refs.get("selectFrame").request(() => {
          const value = context.get("focusedValue")
          if (!value || context.get("value") === value) return

          if (event.src === "keyboard") {
            const triggerEl = dom.getTriggerEl(scope, value)
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
      setValue({ context, event }) {
        context.set("value", event.value)
      },
      toggleValue({ context, event, prop }) {
        const deselect = prop("deselectable") && context.get("value") === event.value
        context.set("value", deselect ? null : event.value)
      },
      syncTabStopValue({ context, scope }) {
        const selectedEl = dom.getTriggerEl(scope, context.get("value"))
        const reachable = selectedEl != null && !selectedEl.hasAttribute("disabled")
        context.set("tabStopValue", reachable ? null : (dom.getFirstTriggerEl(scope)?.dataset.value ?? null))
      },

      moveFocus(params) {
        const { context, prop, scope, event } = params
        const focusedValue = context.get("focusedValue")
        focusTrigger(params, () => {
          if (event.to === "first") return dom.getFirstTriggerEl(scope)
          if (event.to === "last") return dom.getLastTriggerEl(scope)
          if (!focusedValue) return null
          return dom.getSiblingTriggerEl(scope, focusedValue, event.to === "next" ? 1 : -1, prop("loopFocus"))
        })
      },

      stepValue({ context, prop, scope, event }) {
        const triggerEl = dom.getSiblingTriggerEl(
          scope,
          event.from ?? context.get("value"),
          event.step,
          prop("loopFocus"),
        )
        const value = triggerEl?.dataset.value
        if (value == null) return
        context.set("value", value)
        if (prop("virtualFocus")) context.set("focusedValue", value)
      },

      setActivationDirection({ refs, computed, context, scope, prop }) {
        const previousValue = refs.get("previousValue")
        const value = context.get("value")
        context.set("activationDirection", computed("activationDirection"))
        refs.set("previousValue", value)

        // A tab added and selected in the same update may not be rendered yet
        if (value == null || dom.getTriggerEl(scope, value)) return
        refs.get("directionFrame").request(() => {
          context.set(
            "activationDirection",
            dom.getActivationDirection(scope, previousValue, value, prop("orientation")),
          )
        })
      },

      syncTabIndex({ context, scope, refs }) {
        refs.get("tabIndexFrame").request(() => {
          const contentEl = dom.getContentEl(scope, context.get("value") ?? "")
          context.set("hasFocusableContent", contentEl != null && getFocusables(contentEl).length > 0)
        })
      },
      cancelFocusFrame({ refs }) {
        refs.get("focusFrame").cancel()
      },
      cancelFrames({ refs }) {
        refs.get("focusFrame").cancel()
        refs.get("indicatorFrame").cancel()
        refs.get("selectFrame").cancel()
        refs.get("tabIndexFrame").cancel()
        refs.get("directionFrame").cancel()
      },
      cleanupObserver({ refs }) {
        const cleanup = refs.get("indicatorCleanup")
        if (cleanup) cleanup()
      },
      setIndicatorRect({ context, event, scope }) {
        if (!dom.getIndicatorEl(scope)) return
        const triggerEl = dom.getTriggerEl(scope, event.value ?? context.get("value"))
        if (!triggerEl) return
        context.set("indicatorRect", dom.getTriggerRect(scope, triggerEl))
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
          return triggerEl ? dom.getTriggerRect(scope, triggerEl) : null
        }

        const rect = getRect()
        if (rect) context.set("indicatorRect", (prev) => (isEqual(prev, rect) ? prev : rect))

        // Observers fire once on observe; only report real changes
        const onResize = () => {
          const rect = getRect()
          if (!rect || isEqual(context.get("indicatorRect"), rect)) return
          send({
            type: "INDICATOR.RESIZE",
            rect,
            transitioning: indicatorEl.getAnimations?.().length > 0,
          })
        }

        const triggerEls = dom.getElements(scope)
        const listEl = dom.getListEl(scope)
        const indicatorCleanup = callAll(
          ...triggerEls.map((el) => resizeObserverBorderBox.observe(el, onResize)),
          ...(listEl
            ? [
                resizeObserverBorderBox.observe(listEl, onResize),
                addDomEvent(listEl, "scroll", onResize, { passive: true }),
              ]
            : []),
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

    effects: {
      trackTriggers({ scope, send }) {
        return observeChildren(() => dom.getListEl(scope), {
          attributes: true,
          attributeFilter: ["disabled"],
          callback() {
            send({ type: "TRIGGERS.CHANGE" })
          },
        })
      },
    },
  },
})

function focusTrigger(params: Params<TabsSchema>, getTriggerEl: () => HTMLElement | null | undefined) {
  const { context, prop, refs } = params
  refs.get("focusFrame").request(() => {
    const triggerEl = getTriggerEl()
    if (!prop("virtualFocus")) {
      triggerEl?.focus()
      return
    }
    if (triggerEl?.dataset.value != null) context.set("focusedValue", triggerEl.dataset.value)
  })
}
