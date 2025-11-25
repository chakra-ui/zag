import { memo, setup } from "@zag-js/core"
import {
  addDomEvent,
  isSafari,
  observeAttributes,
  raf,
  requestPointerLock,
  setElementValue,
  trackFormControl,
} from "@zag-js/dom-query"
import type { Point } from "@zag-js/types"
import {
  callAll,
  clampValue,
  decrementValue,
  incrementValue,
  isValueAtMax,
  isValueAtMin,
  isValueWithinRange,
} from "@zag-js/utils"
import { restoreCursor } from "./cursor"
import * as dom from "./number-input.dom"
import type { HintValue, NumberInputSchema } from "./number-input.types"
import { createFormatter, createParser, formatValue, getDefaultStep, parseValue } from "./number-input.utils"

const { choose, guards, createMachine } = setup<NumberInputSchema>()

const { not, and } = guards

export const machine = createMachine({
  props({ props }) {
    const step = getDefaultStep(props.step, props.formatOptions)
    return {
      dir: "ltr",
      locale: "en-US",
      focusInputOnChange: true,
      clampValueOnBlur: !props.allowOverflow,
      allowOverflow: false,
      inputMode: "decimal",
      pattern: "-?[0-9]*(.[0-9]+)?",
      defaultValue: "",
      step,
      min: Number.MIN_SAFE_INTEGER,
      max: Number.MAX_SAFE_INTEGER,
      spinOnPress: true,
      ...props,
      translations: {
        incrementLabel: "increment value",
        decrementLabel: "decrease value",
        ...props.translations,
      },
    }
  },

  initialState() {
    return "idle"
  },

  context({ prop, bindable, getComputed }) {
    return {
      value: bindable<string>(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        onChange(value) {
          const computed = getComputed()
          const valueAsNumber = parseValue(value, { computed, prop })
          prop("onValueChange")?.({ value, valueAsNumber })
        },
      })),
      hint: bindable<HintValue | null>(() => ({ defaultValue: null })),
      scrubberCursorPoint: bindable<Point | null>(() => ({
        defaultValue: null,
        hash(value) {
          return value ? `x:${value.x}, y:${value.y}` : ""
        },
      })),
      fieldsetDisabled: bindable<boolean>(() => ({ defaultValue: false })),
    }
  },

  computed: {
    isRtl: ({ prop }) => prop("dir") === "rtl",
    valueAsNumber: ({ context, computed, prop }) => parseValue(context.get("value"), { computed, prop }),
    formattedValue: ({ computed, prop }) => formatValue(computed("valueAsNumber"), { computed, prop }),
    isAtMin: ({ computed, prop }) => isValueAtMin(computed("valueAsNumber"), prop("min")),
    isAtMax: ({ computed, prop }) => isValueAtMax(computed("valueAsNumber"), prop("max")),
    isOutOfRange: ({ computed, prop }) => !isValueWithinRange(computed("valueAsNumber"), prop("min"), prop("max")),
    isValueEmpty: ({ context }) => context.get("value") === "",
    isDisabled: ({ prop, context }) => !!prop("disabled") || context.get("fieldsetDisabled"),
    canIncrement: ({ prop, computed }) => prop("allowOverflow") || !computed("isAtMax"),
    canDecrement: ({ prop, computed }) => prop("allowOverflow") || !computed("isAtMin"),
    valueText: ({ prop, context }) => prop("translations").valueText?.(context.get("value")),
    formatter: memo(
      ({ prop }) => [prop("locale"), prop("formatOptions")],
      ([locale, formatOptions]) => createFormatter(locale, formatOptions),
    ),
    parser: memo(
      ({ prop }) => [prop("locale"), prop("formatOptions")],
      ([locale, formatOptions]) => createParser(locale, formatOptions),
    ),
  },

  watch({ track, action, context, computed, prop }) {
    track([() => context.get("value"), () => prop("locale")], () => {
      action(["syncInputElement"])
    })

    track([() => computed("isOutOfRange")], () => {
      action(["invokeOnInvalid"])
    })

    track([() => context.hash("scrubberCursorPoint")], () => {
      action(["setVirtualCursorPosition"])
    })
  },

  effects: ["trackFormControl"],

  on: {
    "VALUE.SET": {
      actions: ["setRawValue"],
    },
    "VALUE.CLEAR": {
      actions: ["clearValue"],
    },
    "VALUE.INCREMENT": {
      actions: ["increment"],
    },
    "VALUE.DECREMENT": {
      actions: ["decrement"],
    },
  },

  states: {
    idle: {
      on: {
        "TRIGGER.PRESS_DOWN": [
          { guard: "isTouchPointer", target: "before:spin", actions: ["setHint"] },
          {
            target: "before:spin",
            actions: ["focusInput", "invokeOnFocus", "setHint"],
          },
        ],
        "SCRUBBER.PRESS_DOWN": {
          target: "scrubbing",
          actions: ["focusInput", "invokeOnFocus", "setHint", "setCursorPoint"],
        },
        "INPUT.FOCUS": {
          target: "focused",
          actions: ["focusInput", "invokeOnFocus"],
        },
      },
    },

    focused: {
      tags: ["focus"],
      effects: ["attachWheelListener"],
      on: {
        "TRIGGER.PRESS_DOWN": [
          { guard: "isTouchPointer", target: "before:spin", actions: ["setHint"] },
          { target: "before:spin", actions: ["focusInput", "setHint"] },
        ],
        "SCRUBBER.PRESS_DOWN": {
          target: "scrubbing",
          actions: ["focusInput", "setHint", "setCursorPoint"],
        },
        "INPUT.ARROW_UP": {
          actions: ["increment"],
        },
        "INPUT.ARROW_DOWN": {
          actions: ["decrement"],
        },
        "INPUT.HOME": {
          actions: ["decrementToMin"],
        },
        "INPUT.END": {
          actions: ["incrementToMax"],
        },
        "INPUT.CHANGE": {
          actions: ["setValue", "setHint"],
        },
        "INPUT.BLUR": [
          {
            guard: and("clampValueOnBlur", not("isInRange")),
            target: "idle",
            actions: ["setClampedValue", "clearHint", "invokeOnBlur"],
          },
          {
            guard: not("isInRange"),
            target: "idle",
            actions: ["setFormattedValue", "clearHint", "invokeOnBlur", "invokeOnInvalid"],
          },
          {
            target: "idle",
            actions: ["setFormattedValue", "clearHint", "invokeOnBlur"],
          },
        ],
        "INPUT.ENTER": {
          actions: ["setFormattedValue", "clearHint", "invokeOnBlur"],
        },
      },
    },

    "before:spin": {
      tags: ["focus"],
      effects: ["trackButtonDisabled", "waitForChangeDelay"],
      entry: choose([
        { guard: "isIncrementHint", actions: ["increment"] },
        { guard: "isDecrementHint", actions: ["decrement"] },
      ]),
      on: {
        CHANGE_DELAY: {
          target: "spinning",
          guard: and("isInRange", "spinOnPress"),
        },
        "TRIGGER.PRESS_UP": [
          { guard: "isTouchPointer", target: "focused", actions: ["clearHint"] },
          { target: "focused", actions: ["focusInput", "clearHint"] },
        ],
      },
    },

    spinning: {
      tags: ["focus"],
      effects: ["trackButtonDisabled", "spinValue"],
      on: {
        SPIN: [
          {
            guard: "isIncrementHint",
            actions: ["increment"],
          },
          {
            guard: "isDecrementHint",
            actions: ["decrement"],
          },
        ],
        "TRIGGER.PRESS_UP": {
          target: "focused",
          actions: ["focusInput", "clearHint"],
        },
      },
    },

    scrubbing: {
      tags: ["focus"],
      effects: ["activatePointerLock", "trackMousemove", "setupVirtualCursor", "preventTextSelection"],
      on: {
        "SCRUBBER.POINTER_UP": {
          target: "focused",
          actions: ["focusInput", "clearCursorPoint"],
        },
        "SCRUBBER.POINTER_MOVE": [
          {
            guard: "isIncrementHint",
            actions: ["increment", "setCursorPoint"],
          },
          {
            guard: "isDecrementHint",
            actions: ["decrement", "setCursorPoint"],
          },
        ],
      },
    },
  },

  implementations: {
    guards: {
      clampValueOnBlur: ({ prop }) => prop("clampValueOnBlur"),
      spinOnPress: ({ prop }) => !!prop("spinOnPress"),
      isInRange: ({ computed }) => !computed("isOutOfRange"),
      isDecrementHint: ({ context, event }) => (event.hint ?? context.get("hint")) === "decrement",
      isIncrementHint: ({ context, event }) => (event.hint ?? context.get("hint")) === "increment",
      isTouchPointer: ({ event }) => event.pointerType === "touch",
    },

    effects: {
      waitForChangeDelay({ send }) {
        const id = setTimeout(() => {
          send({ type: "CHANGE_DELAY" })
        }, 300)
        return () => clearTimeout(id)
      },

      spinValue({ send }) {
        const id = setInterval(() => {
          send({ type: "SPIN" })
        }, 50)
        return () => clearInterval(id)
      },

      trackFormControl({ context, scope }) {
        const inputEl = dom.getInputEl(scope)
        return trackFormControl(inputEl, {
          onFieldsetDisabledChange(disabled) {
            context.set("fieldsetDisabled", disabled)
          },
          onFormReset() {
            context.set("value", context.initial("value"))
          },
        })
      },
      setupVirtualCursor({ context, scope }) {
        const point = context.get("scrubberCursorPoint")
        return dom.setupVirtualCursor(scope, point)
      },
      preventTextSelection({ scope }) {
        return dom.preventTextSelection(scope)
      },
      trackButtonDisabled({ context, scope, send }) {
        const hint = context.get("hint")
        const btn = dom.getPressedTriggerEl(scope, hint)
        return observeAttributes(btn, {
          attributes: ["disabled"],
          callback() {
            send({ type: "TRIGGER.PRESS_UP", src: "attr" })
          },
        })
      },
      attachWheelListener({ scope, send, prop }) {
        const inputEl = dom.getInputEl(scope)
        if (!inputEl || !scope.isActiveElement(inputEl) || !prop("allowMouseWheel")) return

        function onWheel(event: WheelEvent) {
          event.preventDefault()
          const dir = Math.sign(event.deltaY) * -1
          if (dir === 1) {
            send({ type: "VALUE.INCREMENT" })
          } else if (dir === -1) {
            send({ type: "VALUE.DECREMENT" })
          }
        }

        return addDomEvent(inputEl, "wheel", onWheel, { passive: false })
      },
      activatePointerLock({ scope }) {
        if (isSafari()) return
        return requestPointerLock(scope.getDoc())
      },
      trackMousemove({ scope, send, context, computed }) {
        const doc = scope.getDoc()

        function onMousemove(event: MouseEvent) {
          const point = context.get("scrubberCursorPoint")
          const isRtl = computed("isRtl")
          const value = dom.getMousemoveValue(scope, { point, isRtl, event })
          if (!value.hint) return
          send({
            type: "SCRUBBER.POINTER_MOVE",
            hint: value.hint,
            point: value.point,
          })
        }

        function onMouseup() {
          send({ type: "SCRUBBER.POINTER_UP" })
        }

        return callAll(addDomEvent(doc, "mousemove", onMousemove, false), addDomEvent(doc, "mouseup", onMouseup, false))
      },
    },

    actions: {
      focusInput({ scope, prop }) {
        if (!prop("focusInputOnChange")) return
        const inputEl = dom.getInputEl(scope)
        if (scope.isActiveElement(inputEl)) return
        raf(() => inputEl?.focus({ preventScroll: true }))
      },
      increment({ context, event, prop, computed }) {
        let nextValue = incrementValue(computed("valueAsNumber"), event.step ?? prop("step"))
        if (!prop("allowOverflow")) nextValue = clampValue(nextValue, prop("min"), prop("max"))
        context.set("value", formatValue(nextValue, { computed, prop }))
      },
      decrement({ context, event, prop, computed }) {
        let nextValue = decrementValue(computed("valueAsNumber"), event.step ?? prop("step"))
        if (!prop("allowOverflow")) nextValue = clampValue(nextValue, prop("min"), prop("max"))
        context.set("value", formatValue(nextValue, { computed, prop }))
      },
      setClampedValue({ context, prop, computed }) {
        const nextValue = clampValue(computed("valueAsNumber"), prop("min"), prop("max"))
        context.set("value", formatValue(nextValue, { computed, prop }))
      },
      setRawValue({ context, event, prop, computed }) {
        let nextValue = parseValue(event.value, { computed, prop })
        if (!prop("allowOverflow")) nextValue = clampValue(nextValue, prop("min"), prop("max"))
        context.set("value", formatValue(nextValue, { computed, prop }))
      },
      setValue({ context, event }) {
        const value = event.target?.value ?? event.value
        context.set("value", value)
      },
      clearValue({ context }) {
        context.set("value", "")
      },
      incrementToMax({ context, prop, computed }) {
        const value = formatValue(prop("max"), { computed, prop })
        context.set("value", value)
      },
      decrementToMin({ context, prop, computed }) {
        const value = formatValue(prop("min"), { computed, prop })
        context.set("value", value)
      },
      setHint({ context, event }) {
        context.set("hint", event.hint)
      },
      clearHint({ context }) {
        context.set("hint", null)
      },
      invokeOnFocus({ computed, prop }) {
        prop("onFocusChange")?.({
          focused: true,
          value: computed("formattedValue"),
          valueAsNumber: computed("valueAsNumber"),
        })
      },
      invokeOnBlur({ computed, prop }) {
        prop("onFocusChange")?.({
          focused: false,
          value: computed("formattedValue"),
          valueAsNumber: computed("valueAsNumber"),
        })
      },
      invokeOnInvalid({ computed, prop, event }) {
        if (event.type === "INPUT.CHANGE") return
        const reason = computed("valueAsNumber") > prop("max") ? "rangeOverflow" : "rangeUnderflow"
        prop("onValueInvalid")?.({
          reason,
          value: computed("formattedValue"),
          valueAsNumber: computed("valueAsNumber"),
        })
      },
      syncInputElement({ context, event, computed, scope }) {
        const value = event.type.endsWith("CHANGE") ? context.get("value") : computed("formattedValue")
        const inputEl = dom.getInputEl(scope)
        const sel = event.selection
        raf(() => {
          setElementValue(inputEl, value)
          restoreCursor(inputEl, sel, scope)
        })
      },
      setFormattedValue({ context, computed, action }) {
        context.set("value", computed("formattedValue"))
        action(["syncInputElement"])
      },
      setCursorPoint({ context, event }) {
        context.set("scrubberCursorPoint", event.point)
      },
      clearCursorPoint({ context }) {
        context.set("scrubberCursorPoint", null)
      },
      setVirtualCursorPosition({ context, scope }) {
        const cursorEl = dom.getCursorEl(scope)
        const point = context.get("scrubberCursorPoint")
        if (!cursorEl || !point) return
        cursorEl.style.transform = `translate3d(${point.x}px, ${point.y}px, 0px)`
      },
    },
  },
})
