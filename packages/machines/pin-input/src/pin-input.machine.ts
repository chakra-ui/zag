import { createMachine, guards } from "@zag-js/core"
import { raf } from "@zag-js/dom-query"
import { dispatchInputValueEvent } from "@zag-js/form-utils"
import { compact, isEqual } from "@zag-js/utils"
import { dom } from "./pin-input.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./pin-input.types"

const { and, not } = guards

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "pin-input",
      initial: ctx.autoFocus ? "focused" : "idle",
      context: {
        value: [],
        focusedIndex: -1,
        placeholder: "○",
        otp: false,
        type: "numeric",
        ...ctx,
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
        focusedValue: (ctx) => ctx.value[ctx.focusedIndex],
      },

      watch: {
        focusedIndex: ["focusInput", "selectInputIfNeeded"],
        value: ["syncInputElements"],
        isValueComplete: ["invokeOnComplete", "blurFocusedInputIfNeeded"],
      },

      entry: ctx.autoFocus ? ["setupValue", "setFocusIndexToFirst"] : ["setupValue"],

      on: {
        SET_VALUE: [
          {
            guard: "hasIndex",
            actions: ["setValueAtIndex"],
          },
          { actions: ["setValue"] },
        ],
        CLEAR_VALUE: [
          {
            guard: "isDisabled",
            actions: ["clearValue"],
          },
          {
            actions: ["clearValue", "setFocusIndexToFirst"],
          },
        ],
      },

      states: {
        idle: {
          on: {
            FOCUS: {
              target: "focused",
              actions: "setFocusedIndex",
            },
          },
        },
        focused: {
          on: {
            INPUT: [
              {
                guard: and("isFinalValue", "isValidValue"),
                actions: ["setFocusedValue", "syncInputValue"],
              },
              {
                guard: "isValidValue",
                actions: ["setFocusedValue", "setNextFocusedIndex", "syncInputValue"],
              },
            ],
            PASTE: [
              {
                guard: "isValidValue",
                actions: ["setPastedValue", "setLastValueFocusIndex"],
              },
              { actions: ["revertInputValue"] },
            ],
            BLUR: {
              target: "idle",
              actions: "clearFocusedIndex",
            },
            DELETE: {
              guard: "hasValue",
              actions: ["clearFocusedValue"],
            },
            ARROW_LEFT: {
              actions: "setPrevFocusedIndex",
            },
            ARROW_RIGHT: {
              actions: "setNextFocusedIndex",
            },
            BACKSPACE: [
              {
                guard: "hasValue",
                actions: ["clearFocusedValue"],
              },
              {
                actions: ["setPrevFocusedIndex", "clearFocusedValue"],
              },
            ],
            ENTER: {
              guard: "isValueComplete",
              actions: "requestFormSubmit",
            },
            KEY_DOWN: {
              guard: not("isValidValue"),
              actions: ["preventDefault", "invokeOnInvalid"],
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
        isValidValue(ctx, evt) {
          if (!ctx.pattern) return isValidType(evt.value, ctx.type)
          const regex = new RegExp(ctx.pattern, "g")
          return regex.test(evt.value)
        },
        isFinalValue(ctx) {
          return (
            ctx.filledValueLength + 1 === ctx.valueLength &&
            ctx.value.findIndex((v) => v.trim() === "") === ctx.focusedIndex
          )
        },
        isLastInputFocused: (ctx) => ctx.focusedIndex === ctx.valueLength - 1,
        hasIndex: (_ctx, evt) => evt.index !== undefined,
        isDisabled: (ctx) => !!ctx.disabled,
      },
      actions: {
        setupValue(ctx) {
          if (ctx.value.length) return
          const inputs = dom.getInputEls(ctx)
          const emptyValues = Array.from<string>({ length: inputs.length }).fill("")
          assignValue(ctx, emptyValues)
        },
        focusInput(ctx) {
          raf(() => {
            if (ctx.focusedIndex === -1) return
            dom.getFocusedInputEl(ctx)?.focus()
          })
        },
        selectInputIfNeeded(ctx) {
          raf(() => {
            if (ctx.focusedIndex === -1) return
            const input = dom.getFocusedInputEl(ctx)
            const length = input.value.length
            input.selectionStart = ctx.selectOnFocus ? 0 : length
            input.selectionEnd = length
          })
        },
        invokeOnComplete(ctx) {
          if (!ctx.isValueComplete) return
          ctx.onComplete?.({ value: Array.from(ctx.value), valueAsString: ctx.valueAsString })
        },
        invokeOnInvalid(ctx, evt) {
          ctx.onInvalid?.({ value: evt.value, index: ctx.focusedIndex })
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
            const startIndex = ctx.focusedValue ? 1 : 0
            const value = evt.value.substring(startIndex, startIndex + ctx.valueLength)
            set.value(ctx, value)
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
        preventDefault(_, evt) {
          evt.preventDefault()
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

const REGEX = {
  numeric: /^[0-9]+$/,
  alphabetic: /^[A-Za-z]+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/i,
}

function isValidType(value: string, type: MachineContext["type"]) {
  if (!type) return true
  return !!REGEX[type]?.test(value)
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
  return nextValue
}

const invoke = {
  change(ctx: MachineContext) {
    // callback
    ctx.onChange?.({ value: Array.from(ctx.value) })

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
