import { createGuards, createMachine } from "@zag-js/core"
import { dispatchInputCheckedEvent, nextTick, trackFormControl } from "@zag-js/dom-query"
import { trackElementRect } from "@zag-js/element-rect"
import { trackFocusVisible } from "@zag-js/focus-visible"
import { isString } from "@zag-js/utils"
import * as dom from "./radio-group.dom"
import type { IndicatorRect, RadioGroupSchema } from "./radio-group.types"

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
      hoveredValue: bindable<string | null>(() => ({
        defaultValue: null,
      })),
      indicatorRect: bindable<Partial<IndicatorRect>>(() => ({
        defaultValue: {},
      })),
      canIndicatorTransition: bindable<boolean>(() => ({
        defaultValue: false,
      })),
      fieldsetDisabled: bindable<boolean>(() => ({
        defaultValue: false,
      })),
      focusVisible: bindable<boolean>(() => ({
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
    }
  },

  computed: {
    isDisabled: ({ prop, context }) => !!prop("disabled") || context.get("fieldsetDisabled"),
  },

  entry: ["syncIndicatorRect", "syncSsr"],

  exit: ["cleanupObserver"],

  effects: ["trackFormControlState", "trackFocusVisible"],

  watch({ track, action, context }) {
    track([() => context.get("value")], () => {
      action(["setIndicatorTransition", "syncIndicatorRect", "syncInputElements"])
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
  },

  states: {
    idle: {},
  },

  implementations: {
    guards: {
      isTrusted: ({ event }) => !!event.isTrusted,
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
        context.set("focusVisible", event.focusVisible)
      },
      syncInputElements({ context, scope }) {
        const inputs = dom.getInputEls(scope)
        inputs.forEach((input) => {
          input.checked = input.value === context.get("value")
        })
      },
      setIndicatorTransition({ context }) {
        context.set("canIndicatorTransition", isString(context.get("value")))
      },
      cleanupObserver({ refs }) {
        refs.get("indicatorCleanup")?.()
      },
      syncSsr({ context }) {
        context.set("ssr", false)
      },
      syncIndicatorRect({ context, scope, refs }) {
        refs.get("indicatorCleanup")?.()

        if (!dom.getIndicatorEl(scope)) return

        const value = context.get("value")
        const radioEl = dom.getRadioEl(scope, value)

        if (value == null || !radioEl) {
          context.set("indicatorRect", {})
          return
        }

        const indicatorCleanup = trackElementRect(radioEl, {
          getRect(el) {
            return dom.getOffsetRect(el)
          },
          onChange(rect) {
            context.set("indicatorRect", dom.resolveRect(rect))
            nextTick(() => {
              context.set("canIndicatorTransition", false)
            })
          },
        })

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
