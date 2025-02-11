import { createMachine } from "@zag-js/core"
import { dispatchInputValueEvent, raf, setElementValue } from "@zag-js/dom-query"
import { isEqual } from "@zag-js/utils"
import * as dom from "./pin-input.dom"
import type { PinInputSchema } from "./pin-input.types"

export const machine = createMachine<PinInputSchema>({
  props({ props }) {
    return {
      placeholder: "○",
      otp: false,
      type: "numeric",
      defaultValue: [],
      ...props,
      translations: {
        inputLabel: (index, length) => `pin code ${index + 1} of ${length}`,
        ...props.translations,
      },
    }
  },

  initialState() {
    return "idle"
  },

  context({ prop, bindable }) {
    return {
      value: bindable(() => ({
        value: prop("value"),
        defaultValue: prop("defaultValue"),
        isEqual: isEqual,
        onChange(value) {
          prop("onValueChange")?.({ value, valueAsString: value.join("") })
        },
      })),
      focusedIndex: bindable(() => ({
        defaultValue: -1,
      })),
    }
  },

  computed: {
    valueLength: ({ context }) => context.get("value").length,
    filledValueLength: ({ context }) => context.get("value").filter((v) => v?.trim() !== "").length,
    isValueComplete: ({ context }) => {
      const value = context.get("value")
      const filledValueLength = value.filter((v) => v?.trim() !== "").length
      return value.length === filledValueLength
    },
    valueAsString: ({ context }) => context.get("value").join(""),
    focusedValue: ({ context }) => context.get("value")[context.get("focusedIndex")] || "",
  },

  entry: ["raiseInitEvent"],

  watch({ action, track, context, computed }) {
    track([() => context.get("focusedIndex")], () => {
      action(["focusInput", "selectInputIfNeeded"])
    })
    track([() => context.get("value").toString()], () => {
      action(["syncInputElements", "dispatchInputEvent"])
    })
    track([() => computed("isValueComplete")], () => {
      action(["invokeOnComplete", "blurFocusedInputIfNeeded"])
    })
  },

  on: {
    "VALUE.SET": [
      {
        guard: "hasIndex",
        actions: ["setValueAtIndex"],
      },
      { actions: ["setValue"] },
    ],
    "VALUE.CLEAR": {
      actions: ["clearValue", "setFocusIndexToFirst"],
    },
  },

  states: {
    idle: {
      on: {
        "INPUT.FOCUS": {
          target: "focused",
          actions: ["setFocusedIndex"],
        },
        INIT: [
          {
            guard: "autoFocus",
            actions: ["setupValue", "setFocusIndexToFirst"],
          },
          { actions: ["setupValue"] },
        ],
      },
    },
    focused: {
      on: {
        "INPUT.CHANGE": [
          {
            guard: "isFinalValue",
            actions: ["setFocusedValue", "syncInputValue"],
          },
          {
            actions: ["setFocusedValue", "setNextFocusedIndex", "syncInputValue"],
          },
        ],
        "INPUT.PASTE": {
          actions: ["setPastedValue", "setLastValueFocusIndex"],
        },
        "INPUT.BLUR": {
          target: "idle",
          actions: ["clearFocusedIndex"],
        },
        "INPUT.DELETE": {
          guard: "hasValue",
          actions: ["clearFocusedValue"],
        },
        "INPUT.ARROW_LEFT": {
          actions: ["setPrevFocusedIndex"],
        },
        "INPUT.ARROW_RIGHT": {
          actions: ["setNextFocusedIndex"],
        },
        "INPUT.BACKSPACE": [
          {
            guard: "hasValue",
            actions: ["clearFocusedValue"],
          },
          {
            actions: ["setPrevFocusedIndex", "clearFocusedValue"],
          },
        ],
        "INPUT.ENTER": {
          guard: "isValueComplete",
          actions: ["requestFormSubmit"],
        },
        "VALUE.INVALID": {
          actions: ["invokeOnInvalid"],
        },
      },
    },
  },

  implementations: {
    guards: {
      autoFocus: ({ prop }) => !!prop("autoFocus"),
      isValueEmpty: ({ event }) => event.value === "",
      hasValue: ({ context }) => context.get("value")[context.get("focusedIndex")] !== "",
      isValueComplete: ({ computed }) => computed("isValueComplete"),
      isFinalValue: ({ context, computed }) =>
        computed("filledValueLength") + 1 === computed("valueLength") &&
        context.get("value").findIndex((v) => v.trim() === "") === context.get("focusedIndex"),
      hasIndex: ({ event }) => event.index !== undefined,
      isDisabled: ({ prop }) => !!prop("disabled"),
    },

    actions: {
      raiseInitEvent({ send }) {
        send({ type: "INIT" })
      },
      dispatchInputEvent({ computed, scope }) {
        const inputEl = dom.getHiddenInputEl(scope)
        dispatchInputValueEvent(inputEl, { value: computed("valueAsString") })
      },
      setupValue({ context, scope }) {
        if (context.get("value").length) return
        const inputEls = dom.getInputEls(scope)
        const emptyValues = Array.from<string>({ length: inputEls.length }).fill("")
        context.set("value", emptyValues)
      },
      focusInput({ context, scope }) {
        const focusedIndex = context.get("focusedIndex")
        if (focusedIndex === -1) return
        dom.getInputElAtIndex(scope, focusedIndex)?.focus({ preventScroll: true })
      },
      selectInputIfNeeded({ context, prop, scope }) {
        const focusedIndex = context.get("focusedIndex")
        if (!prop("selectOnFocus") || focusedIndex === -1) return
        raf(() => {
          dom.getInputElAtIndex(scope, focusedIndex)?.select()
        })
      },
      invokeOnComplete({ context, computed, prop }) {
        if (!computed("isValueComplete")) return
        prop("onValueComplete")?.({
          value: Array.from(context.get("value")),
          valueAsString: computed("valueAsString"),
        })
      },
      invokeOnInvalid({ context, event, prop }) {
        prop("onValueInvalid")?.({
          value: event.value,
          index: context.get("focusedIndex"),
        })
      },
      clearFocusedIndex({ context }) {
        context.set("focusedIndex", -1)
      },
      setFocusedIndex({ context, event }) {
        context.set("focusedIndex", event.index)
      },
      setValue({ context, event }) {
        context.set("value", event.value)
      },
      setFocusedValue({ context, event, computed }) {
        const focusedValue = computed("focusedValue")
        const nextValue = getNextValue(focusedValue, event.value)
        context.set("value", (prev) => {
          const next = [...prev]
          next[context.get("focusedIndex")] = nextValue
          return next
        })
      },
      revertInputValue({ context, computed, scope }) {
        const inputEl = dom.getInputElAtIndex(scope, context.get("focusedIndex"))
        setElementValue(inputEl, computed("focusedValue"))
      },
      syncInputValue({ context, event, scope }) {
        const value = context.get("value")
        const inputEl = dom.getInputElAtIndex(scope, event.index)
        setElementValue(inputEl, value[event.index])
      },
      syncInputElements({ context, scope }) {
        const inputEls = dom.getInputEls(scope)
        inputEls.forEach((inputEl, index) => {
          setElementValue(inputEl, context.get("value")[index])
        })
      },
      setPastedValue({ context, event, computed }) {
        raf(() => {
          const valueAsString = computed("valueAsString")
          const focusedIndex = context.get("focusedIndex")
          const filledValueLength = computed("filledValueLength")

          const startIndex = Math.min(focusedIndex, filledValueLength)

          // keep value left of cursor
          // replace value from cursor to end with pasted text
          const left = startIndex > 0 ? valueAsString.substring(0, focusedIndex) : ""
          const right = event.value.substring(0, computed("valueLength") - startIndex)

          const value = left + right

          context.set("value", value.split(""))
        })
      },
      setValueAtIndex({ context, event, computed }) {
        const nextValue = getNextValue(computed("focusedValue"), event.value)
        context.set("value", (prev) => {
          const next = [...prev]
          next[event.index] = nextValue
          return next
        })
      },
      clearValue({ context, computed }) {
        const nextValue = Array.from<string>({ length: computed("valueLength") }).fill("")
        context.set("value", nextValue)
      },
      clearFocusedValue({ context }) {
        const focusedIndex = context.get("focusedIndex")
        if (focusedIndex === -1) return
        context.set("value", (prev) => {
          const next = [...prev]
          next[focusedIndex] = ""
          return next
        })
      },
      setFocusIndexToFirst({ context }) {
        context.set("focusedIndex", 0)
      },
      setNextFocusedIndex({ context, computed }) {
        context.set("focusedIndex", Math.min(context.get("focusedIndex") + 1, computed("valueLength") - 1))
      },
      setPrevFocusedIndex({ context }) {
        context.set("focusedIndex", Math.max(context.get("focusedIndex") - 1, 0))
      },
      setLastValueFocusIndex({ context, computed }) {
        raf(() => {
          context.set("focusedIndex", Math.min(computed("filledValueLength"), computed("valueLength") - 1))
        })
      },
      blurFocusedInputIfNeeded({ context, prop, scope }) {
        if (!prop("blurOnComplete")) return
        raf(() => {
          dom.getInputElAtIndex(scope, context.get("focusedIndex"))?.blur()
        })
      },
      requestFormSubmit({ computed, prop, scope }) {
        if (!prop("name") || !computed("isValueComplete")) return
        const inputEl = dom.getHiddenInputEl(scope)
        inputEl?.form?.requestSubmit()
      },
    },
  },
})

function getNextValue(current: string, next: string) {
  let nextValue = next
  if (current[0] === next[0]) nextValue = next[1]
  else if (current[0] === next[1]) nextValue = next[0]
  return nextValue.split("")[nextValue.length - 1]
}
