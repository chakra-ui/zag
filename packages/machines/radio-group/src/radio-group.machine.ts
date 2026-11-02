import { createGuards, createMachine } from "@zag-js/core"
import { AnimationFrame, dispatchInputCheckedEvent, resizeObserverBorderBox, trackFormControl } from "@zag-js/dom-query"
import { trackFocusVisible } from "@zag-js/focus-visible"
import type { Rect } from "@zag-js/types"
import { isEqual } from "@zag-js/utils"
import * as dom from "./radio-group.dom"
import type { RadioGroupSchema } from "./radio-group.types"

const { not } = createGuards()

export const machine = createMachine<RadioGroupSchema>({
  props({ props }) {
    return {
      orientation: "vertical",
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
      activeValue: bindable<string | null>(() => ({
        defaultValue: null,
      })),
      focusedValue: bindable<string | null>(() => ({
        defaultValue: null,
      })),
      focusVisibleValue: bindable<string | null>(() => ({
        defaultValue: null,
      })),
      hoveredValue: bindable<string | null>(() => ({
        defaultValue: null,
      })),
      indicatorRect: bindable<Rect | null>(() => ({
        defaultValue: null,
      })),
      indicatorInstant: bindable<boolean>(() => ({
        defaultValue: false,
      })),
      fieldsetDisabled: bindable<boolean>(() => ({
        defaultValue: false,
      })),
      ssr: bindable<boolean>(() => ({
        defaultValue: true,
      })),
    }
  },

  refs() {
    return {
      indicatorCleanup: null,
      indicatorFrame: AnimationFrame.create(),
      focusVisibleValue: null,
    }
  },

  computed: {
    isDisabled: ({ prop, context }) => !!prop("disabled") || context.get("fieldsetDisabled"),
  },

  entry: ["syncIndicatorRect", "syncSsr"],

  exit: ["cleanupObserver", "cancelIndicatorFrame"],

  effects: ["trackFormControlState", "trackFocusVisible"],

  watch({ track, action, context }) {
    track([() => context.get("value")], () => {
      action(["syncIndicatorRect", "syncInputElements"])
    })
  },

  on: {
    SET_VALUE: [
      {
        guard: not("isTrusted"),
        actions: ["setValue", "dispatchChangeEvent"],
      },
      {
        actions: ["setValue"],
      },
    ],
    SET_HOVERED: {
      actions: ["setHovered"],
    },
    SET_ACTIVE: {
      actions: ["setActive"],
    },
    SET_FOCUSED: {
      actions: ["setFocused"],
    },
    INDICATOR_RESIZE: [
      // A running selection transition retargets to the new rect instead of snapping
      { guard: "isIndicatorTransitioning", actions: ["setResizedIndicatorRect"] },
      { actions: ["snapIndicator", "setResizedIndicatorRect"] },
    ],
  },

  states: {
    idle: {},
  },

  implementations: {
    guards: {
      isTrusted: ({ event }) => !!event.isTrusted,
      isIndicatorTransitioning: ({ event }) => !!event.transitioning,
    },

    effects: {
      trackFormControlState({ context, scope }) {
        return trackFormControl(dom.getRootEl(scope), {
          onFieldsetDisabledChange(disabled) {
            context.set("fieldsetDisabled", disabled)
          },
          onFormReset() {
            context.set("value", context.initial("value"))
          },
        })
      },
      trackFocusVisible({ scope }) {
        return trackFocusVisible({ root: scope.getRootNode?.() })
      },
    },

    actions: {
      setValue({ context, event }) {
        context.set("value", event.value)
      },
      setHovered({ context, event }) {
        context.set("hoveredValue", event.value)
      },
      setActive({ context, event }) {
        context.set("activeValue", event.value)
      },
      setFocused({ context, event }) {
        context.set("focusedValue", event.value)
        const focusVisibleValue = event.value != null && event.focusVisible ? event.value : null
        context.set("focusVisibleValue", focusVisibleValue)
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
      syncInputElements({ context, scope }) {
        const inputs = dom.getInputEls(scope)
        inputs.forEach((input) => {
          input.checked = input.value === context.get("value")
        })
      },
      cleanupObserver({ refs }) {
        refs.get("indicatorCleanup")?.()
      },
      syncSsr({ context }) {
        context.set("ssr", false)
      },
      setResizedIndicatorRect({ context, event }) {
        context.set("indicatorRect", event.rect)
      },
      syncIndicatorRect({ context, scope, refs, send }) {
        refs.get("indicatorCleanup")?.()

        const indicatorEl = dom.getIndicatorEl(scope)
        if (!indicatorEl) return

        const value = context.get("value")
        const radioEl = dom.getRadioEl(scope, value)

        if (value == null || !radioEl) {
          context.set("indicatorRect", null)
          return
        }

        context.set("indicatorRect", dom.getOffsetRect(radioEl))

        // Observers fire once on observe; only report real changes
        const onResize = () => {
          const rect = dom.getOffsetRect(radioEl)
          if (isEqual(context.get("indicatorRect"), rect)) return
          send({ type: "INDICATOR_RESIZE", rect, transitioning: indicatorEl.getAnimations?.().length > 0 })
        }

        const indicatorCleanup = resizeObserverBorderBox.observe(radioEl, onResize)

        refs.set("indicatorCleanup", indicatorCleanup)
      },
      dispatchChangeEvent({ context, scope }) {
        const inputEls = dom.getInputEls(scope)
        inputEls.forEach((inputEl) => {
          const checked = inputEl.value === context.get("value")
          if (checked === inputEl.checked) return
          dispatchInputCheckedEvent(inputEl, { checked })
        })
      },
    },
  },
})
