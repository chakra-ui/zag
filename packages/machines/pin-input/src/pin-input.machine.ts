import { createMachine, guards } from "@zag-js/core"
import { raf } from "@zag-js/dom-query"
import { dispatchInputValueEvent } from "@zag-js/form-utils"
import { compact } from "@zag-js/utils"
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
        focusedIndex: ["focusInput", "setInputSelection"],
        value: ["dispatchInputEvent", "syncInputElements"],
        isValueComplete: ["invokeOnComplete", "blurFocusedInputIfNeeded"],
      },

      entry: ctx.autoFocus ? ["setupValue", "setFocusIndexToFirst"] : ["setupValue"],

      on: {
        SET_VALUE: [
          {
            guard: "hasIndex",
            actions: ["setValueAtIndex", "invokeOnChange"],
          },
          { actions: ["setValue", "invokeOnChange"] },
        ],
        CLEAR_VALUE: [
          {
            guard: "isDisabled",
            actions: ["clearValue", "invokeOnChange"],
          },
          {
            actions: ["clearValue", "invokeOnChange", "setFocusIndexToFirst"],
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
                actions: ["setFocusedValue", "invokeOnChange", "syncInputValue"],
              },
              {
                guard: "isValidValue",
                actions: ["setFocusedValue", "invokeOnChange", "setNextFocusedIndex", "syncInputValue"],
              },
            ],
            PASTE: [
              {
                guard: "isValidValue",
                actions: ["setPastedValue", "invokeOnChange", "setLastValueFocusIndex"],
              },
              { actions: ["resetFocusedValue", "invokeOnChange"] },
            ],
            BLUR: {
              target: "idle",
              actions: "clearFocusedIndex",
            },
            DELETE: {
              guard: "hasValue",
              actions: ["clearFocusedValue", "invokeOnChange"],
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
                actions: ["clearFocusedValue", "invokeOnChange"],
              },
              {
                actions: ["setPrevFocusedIndex", "clearFocusedValue", "invokeOnChange"],
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
        isValidValue: (ctx, evt) => {
          if (!ctx.pattern) return isValidType(evt.value, ctx.type)
          const regex = new RegExp(ctx.pattern, "g")
          return regex.test(evt.value)
        },
        isFinalValue: (ctx) => {
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
        setupValue: (ctx) => {
          const inputs = dom.getElements(ctx)
          const emptyValues = Array.from<string>({ length: inputs.length }).fill("")
          assign(ctx, emptyValues)
        },
        focusInput: (ctx) => {
          raf(() => {
            if (ctx.focusedIndex === -1) return
            dom.getFocusedInputEl(ctx)?.focus()
          })
        },
        setInputSelection: (ctx) => {
          raf(() => {
            if (ctx.focusedIndex === -1) return
            const input = dom.getFocusedInputEl(ctx)
            const length = input.value.length
            input.selectionStart = ctx.selectOnFocus ? 0 : length
            input.selectionEnd = length
          })
        },
        invokeOnComplete: (ctx) => {
          if (!ctx.isValueComplete) return
          ctx.onComplete?.({ value: Array.from(ctx.value), valueAsString: ctx.valueAsString })
        },
        invokeOnChange: (ctx) => {
          ctx.onChange?.({ value: Array.from(ctx.value) })
        },
        dispatchInputEvent: (ctx) => {
          dispatchInputValueEvent(dom.getHiddenInputEl(ctx), ctx.valueAsString)
        },
        invokeOnInvalid: (ctx, evt) => {
          ctx.onInvalid?.({ value: evt.value, index: ctx.focusedIndex })
        },
        clearFocusedIndex: (ctx) => {
          ctx.focusedIndex = -1
        },
        setValue: (ctx, evt) => {
          assign(ctx, evt.value)
        },
        setFocusedIndex: (ctx, evt) => {
          ctx.focusedIndex = evt.index
        },
        setFocusedValue: (ctx, evt) => {
          ctx.value[ctx.focusedIndex] = getNextValue(ctx.focusedValue, evt.value)
        },
        syncInputValue(ctx, evt) {
          const input = dom.getInputEl(ctx, evt.index.toString())
          if (!input) return
          input.value = ctx.value[evt.index]
        },
        syncInputElements(ctx) {
          const inputs = dom.getElements(ctx)
          inputs.forEach((input, index) => {
            input.value = ctx.value[index]
          })
        },
        setPastedValue(ctx, evt) {
          raf(() => {
            const startIndex = ctx.focusedValue ? 1 : 0
            const value = evt.value.substring(startIndex, startIndex + ctx.valueLength)
            assign(ctx, value)
          })
        },
        setValueAtIndex: (ctx, evt) => {
          ctx.value[evt.index] = getNextValue(ctx.focusedValue, evt.value)
        },
        clearValue: (ctx) => {
          const nextValue = Array.from<string>({ length: ctx.valueLength }).fill("")
          assign(ctx, nextValue)
        },
        clearFocusedValue: (ctx) => {
          ctx.value[ctx.focusedIndex] = ""
        },
        resetFocusedValue: (ctx) => {
          const input = dom.getFocusedInputEl(ctx)
          input.value = ctx.focusedValue
        },
        setFocusIndexToFirst: (ctx) => {
          ctx.focusedIndex = 0
        },
        setNextFocusedIndex: (ctx) => {
          ctx.focusedIndex = Math.min(ctx.focusedIndex + 1, ctx.valueLength - 1)
        },
        setPrevFocusedIndex: (ctx) => {
          ctx.focusedIndex = Math.max(ctx.focusedIndex - 1, 0)
        },
        setLastValueFocusIndex: (ctx) => {
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
          const input = dom.getHiddenInputEl(ctx)
          input?.form?.requestSubmit()
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

function assign(ctx: MachineContext, value: string | string[]) {
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
