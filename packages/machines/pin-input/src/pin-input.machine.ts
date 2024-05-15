import { choose, createMachine } from "@zag-js/core"
import { raf } from "@zag-js/dom-query"
import { dispatchInputValueEvent } from "@zag-js/form-utils"
import { compact, isEqual } from "@zag-js/utils"
import { dom } from "./pin-input.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./pin-input.types"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "pin-input",
      initial: "idle",
      context: {
        value: [],
        placeholder: "○",
        otp: false,
        type: "numeric",
        ...ctx,
        focusedIndex: -1,
        translations: {
          inputLabel: (index, length) => `pin code ${index + 1} of ${length}`,
          ...ctx.translations,
        },
      },

      computed: {
        valueLength: (ctx) => ctx.value.length,
        filledValueLength: (ctx) => ctx.value.filter((v) => v?.trim() !== "").length,
        isValueComplete: (ctx) => ctx.valueLength === ctx.filledValueLength,
        valueAsString: (ctx) => ctx.value.join(""),
        focusedValue: (ctx) => ctx.value[ctx.focusedIndex] || "",
      },

      entry: choose([
        {
          guard: "autoFocus",
          actions: ["setupValue", "setFocusIndexToFirst"],
        },
        { actions: ["setupValue"] },
      ]),

      watch: {
        focusedIndex: ["focusInput", "selectInputIfNeeded"],
        value: ["syncInputElements"],
        isValueComplete: ["invokeOnComplete", "blurFocusedInputIfNeeded"],
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
              actions: "setFocusedIndex",
            },
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
              actions: "clearFocusedIndex",
            },
            "INPUT.DELETE": {
              guard: "hasValue",
              actions: "clearFocusedValue",
            },
            "INPUT.ARROW_LEFT": {
              actions: "setPrevFocusedIndex",
            },
            "INPUT.ARROW_RIGHT": {
              actions: "setNextFocusedIndex",
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
              actions: "requestFormSubmit",
            },
            "VALUE.INVALID": {
              actions: "invokeOnInvalid",
            },
          },
        },
      },
    },
    {
      guards: {
        autoFocus: (ctx) => !!ctx.autoFocus,
        isValueEmpty: (_ctx, evt) => evt.value === "",
        hasValue: (ctx) => ctx.value[ctx.focusedIndex] !== "",
        isValueComplete: (ctx) => ctx.isValueComplete,
        isFinalValue: (ctx) =>
          ctx.filledValueLength + 1 === ctx.valueLength &&
          ctx.value.findIndex((v) => v.trim() === "") === ctx.focusedIndex,
        hasIndex: (_ctx, evt) => evt.index !== undefined,
        isDisabled: (ctx) => !!ctx.disabled,
      },
      actions: {
        setupValue(ctx) {
          if (ctx.value.length) return
          const inputEls = dom.getInputEls(ctx)
          const emptyValues = Array.from<string>({ length: inputEls.length }).fill("")
          assignValue(ctx, emptyValues)
        },
        focusInput(ctx) {
          if (ctx.focusedIndex === -1) return
          dom.getFocusedInputEl(ctx)?.focus({ preventScroll: true })
        },
        selectInputIfNeeded(ctx) {
          if (!ctx.selectOnFocus || ctx.focusedIndex === -1) return
          raf(() => {
            dom.getFocusedInputEl(ctx)?.select()
          })
        },
        invokeOnComplete(ctx) {
          if (!ctx.isValueComplete) return
          ctx.onValueComplete?.({
            value: Array.from(ctx.value),
            valueAsString: ctx.valueAsString,
          })
        },
        invokeOnInvalid(ctx, evt) {
          ctx.onValueInvalid?.({
            value: evt.value,
            index: ctx.focusedIndex,
          })
        },
        clearFocusedIndex(ctx) {
          ctx.focusedIndex = -1
        },
        setFocusedIndex(ctx, evt) {
          ctx.focusedIndex = evt.index
        },
        setValue(ctx, evt) {
          set.value(ctx, evt.value)
        },
        setFocusedValue(ctx, evt) {
          const nextValue = getNextValue(ctx.focusedValue, evt.value)
          set.valueAtIndex(ctx, ctx.focusedIndex, nextValue)
        },
        revertInputValue(ctx) {
          const inputEl = dom.getFocusedInputEl(ctx)
          dom.setValue(inputEl, ctx.focusedValue)
        },
        syncInputValue(ctx, evt) {
          const inputEl = dom.getInputEl(ctx, evt.index.toString())
          dom.setValue(inputEl, ctx.value[evt.index])
        },
        syncInputElements(ctx) {
          const inputEls = dom.getInputEls(ctx)
          inputEls.forEach((inputEl, index) => {
            dom.setValue(inputEl, ctx.value[index])
          })
        },
        setPastedValue(ctx, evt) {
          raf(() => {
            const startIndex = Math.min(ctx.focusedIndex, ctx.filledValueLength)

            // keep value left of cursor
            // replace value from curor to end with pasted text
            const left = startIndex > 0 ? ctx.valueAsString.substring(0, ctx.focusedIndex) : ""
            const right = evt.value.substring(0, ctx.valueLength - startIndex)

            const value = left + right

            set.value(ctx, value.split(""))
          })
        },
        setValueAtIndex(ctx, evt) {
          const nextValue = getNextValue(ctx.focusedValue, evt.value)
          set.valueAtIndex(ctx, evt.index, nextValue)
        },
        clearValue(ctx) {
          const nextValue = Array.from<string>({ length: ctx.valueLength }).fill("")
          set.value(ctx, nextValue)
        },
        clearFocusedValue(ctx) {
          set.valueAtIndex(ctx, ctx.focusedIndex, "")
        },
        setFocusIndexToFirst(ctx) {
          ctx.focusedIndex = 0
        },
        setNextFocusedIndex(ctx) {
          ctx.focusedIndex = Math.min(ctx.focusedIndex + 1, ctx.valueLength - 1)
        },
        setPrevFocusedIndex(ctx) {
          ctx.focusedIndex = Math.max(ctx.focusedIndex - 1, 0)
        },
        setLastValueFocusIndex(ctx) {
          raf(() => {
            ctx.focusedIndex = Math.min(ctx.filledValueLength, ctx.valueLength - 1)
          })
        },
        blurFocusedInputIfNeeded(ctx) {
          if (!ctx.blurOnComplete) return
          raf(() => {
            dom.getFocusedInputEl(ctx)?.blur()
          })
        },
        requestFormSubmit(ctx) {
          if (!ctx.name || !ctx.isValueComplete) return
          const inputEl = dom.getHiddenInputEl(ctx)
          inputEl?.form?.requestSubmit()
        },
      },
    },
  )
}

function assignValue(ctx: MachineContext, value: string | string[]) {
  const arr = Array.isArray(value) ? value : value.split("").filter(Boolean)
  arr.forEach((value, index) => {
    ctx.value[index] = value
  })
}

function getNextValue(current: string, next: string) {
  let nextValue = next
  if (current[0] === next[0]) nextValue = next[1]
  else if (current[0] === next[1]) nextValue = next[0]
  return nextValue.split("")[nextValue.length - 1]
}

const invoke = {
  change(ctx: MachineContext) {
    // callback
    ctx.onValueChange?.({
      value: Array.from(ctx.value),
      valueAsString: ctx.valueAsString,
    })

    // form event
    const inputEl = dom.getHiddenInputEl(ctx)
    dispatchInputValueEvent(inputEl, { value: ctx.valueAsString })
  },
}

const set = {
  value(ctx: MachineContext, value: string[]) {
    if (isEqual(ctx.value, value)) return
    assignValue(ctx, value)
    invoke.change(ctx)
  },
  valueAtIndex(ctx: MachineContext, index: number, value: string) {
    if (isEqual(ctx.value[index], value)) return
    ctx.value[index] = value
    invoke.change(ctx)
  },
}
