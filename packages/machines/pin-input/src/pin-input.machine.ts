import { setup } from "@zag-js/core"
import { dispatchInputValueEvent, raf } from "@zag-js/dom-query"
import { isEqual, setValueAtIndex } from "@zag-js/utils"
import * as dom from "./pin-input.dom"
import type { PinInputSchema } from "./pin-input.types"

const { choose, createMachine } = setup<PinInputSchema>()

export const machine = createMachine({
  props({ props }) {
    return {
      placeholder: "○",
      otp: false,
      type: "numeric",
      defaultValue: props.count ? fill([], props.count) : [],
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
        isEqual,
        onChange(value) {
          prop("onValueChange")?.({ value, valueAsString: value.join("") })
        },
      })),
      focusedIndex: bindable(() => ({
        sync: true,
        defaultValue: -1,
      })),
      // TODO: Move this to `props` in next major version
      count: bindable(() => ({
        defaultValue: prop("count"),
      })),
    }
  },

  computed: {
    _value: ({ context }) => fill(context.get("value"), context.get("count")),
    valueLength: ({ computed }) => computed("_value").length,
    filledValueLength: ({ computed }) => computed("_value").filter((v) => v?.trim() !== "").length,
    isValueComplete: ({ computed }) => computed("valueLength") === computed("filledValueLength"),
    valueAsString: ({ computed }) => computed("_value").join(""),
    focusedValue: ({ computed, context }) => computed("_value")[context.get("focusedIndex")] || "",
  },

  entry: choose([
    {
      guard: "autoFocus",
      actions: ["setInputCount", "setFocusIndexToFirst"],
    },
    { actions: ["setInputCount"] },
  ]),

  watch({ action, track, context, computed }) {
    track([() => context.get("focusedIndex")], () => {
      action(["focusInput", "selectInputIfNeeded"])
    })
    track([() => context.get("value").join(",")], () => {
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
      },
    },
    focused: {
      on: {
        "INPUT.CHANGE": {
          actions: ["setFocusedValue", "syncInputValue", "setNextFocusedIndex"],
        },

        "INPUT.PASTE": {
          actions: ["setPastedValue", "setLastValueFocusIndex"],
        },
        "INPUT.FOCUS": {
          actions: ["setFocusedIndex"],
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
      hasValue: ({ context }) => context.get("value")[context.get("focusedIndex")] !== "",
      isValueComplete: ({ computed }) => computed("isValueComplete"),
      hasIndex: ({ event }) => event.index !== undefined,
    },

    actions: {
      dispatchInputEvent({ computed, scope }) {
        const inputEl = dom.getHiddenInputEl(scope)
        dispatchInputValueEvent(inputEl, { value: computed("valueAsString") })
      },
      setInputCount({ scope, context, prop }) {
        if (prop("count")) return
        const inputEls = dom.getInputEls(scope)
        context.set("count", inputEls.length)
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
      invokeOnComplete({ computed, prop }) {
        if (!computed("isValueComplete")) return
        prop("onValueComplete")?.({
          value: computed("_value"),
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
        const value = fill(event.value, context.get("count"))
        context.set("value", value)
      },
      setFocusedValue({ context, event, computed, flush }) {
        const focusedValue = computed("focusedValue")
        const focusedIndex = context.get("focusedIndex")
        const value = getNextValue(focusedValue, event.value)
        flush(() => {
          context.set("value", setValueAtIndex(computed("_value"), focusedIndex, value))
        })
      },
      revertInputValue({ context, computed, scope }) {
        const inputEl = dom.getInputElAtIndex(scope, context.get("focusedIndex"))
        dom.setInputValue(inputEl, computed("focusedValue"))
      },
      syncInputValue({ context, event, scope }) {
        const value = context.get("value")
        const inputEl = dom.getInputElAtIndex(scope, event.index)
        dom.setInputValue(inputEl, value[event.index])
      },
      syncInputElements({ context, scope }) {
        const inputEls = dom.getInputEls(scope)
        const value = context.get("value")
        inputEls.forEach((inputEl, index) => {
          dom.setInputValue(inputEl, value[index])
        })
      },
      setPastedValue({ context, event, computed, flush }) {
        raf(() => {
          const valueAsString = computed("valueAsString")
          const focusedIndex = context.get("focusedIndex")
          const valueLength = computed("valueLength")
          const filledValueLength = computed("filledValueLength")

          const startIndex = Math.min(focusedIndex, filledValueLength)

          // keep value left of cursor
          // replace value from cursor to end with pasted text
          const left = startIndex > 0 ? valueAsString.substring(0, focusedIndex) : ""
          const right = event.value.substring(0, valueLength - startIndex)

          const value = fill(`${left}${right}`.split(""), valueLength)

          flush(() => {
            context.set("value", value)
          })
        })
      },
      setValueAtIndex({ context, event, computed }) {
        const nextValue = getNextValue(computed("focusedValue"), event.value)
        context.set("value", setValueAtIndex(computed("_value"), event.index, nextValue))
      },
      clearValue({ context }) {
        const nextValue = Array.from<string>({ length: context.get("count") }).fill("")
        context.set("value", nextValue)
      },
      clearFocusedValue({ context, computed }) {
        const focusedIndex = context.get("focusedIndex")
        if (focusedIndex === -1) return
        context.set("value", setValueAtIndex(computed("_value"), focusedIndex, ""))
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

function fill(value: string[], count: number) {
  return Array.from<string>({ length: count })
    .fill("")
    .map((v, i) => value[i] || v)
}
