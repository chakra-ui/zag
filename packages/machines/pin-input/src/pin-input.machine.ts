import { createMachine, guards } from "@zag-js/core"
import { raf } from "@zag-js/dom-utils"
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
        value: ["invokeOnChange", "dispatchInputEvent"],
        isValueComplete: ["invokeOnComplete", "blurFocusedInputIfNeeded"],
      },

      on: {
        SET_VALUE: [
          {
            guard: "hasIndex",
            actions: "setValueAtIndex",
          },
          { actions: "setValue" },
        ],
        CLEAR_VALUE: [
          {
            guard: "isDisabled",
            actions: "clearValue",
          },
          {
            actions: ["clearValue", "setFocusIndexToFirst"],
          },
        ],
      },

      entry: ctx.autoFocus ? ["setupValue", "setFocusIndexToFirst"] : "setupValue",

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
                actions: ["setFocusedValue", "dispatchInputEventIfNeeded"],
              },
              {
                guard: "isValidValue",
                actions: ["setFocusedValue", "setNextFocusedIndex", "dispatchInputEventIfNeeded"],
              },
            ],
            PASTE: [
              {
                guard: "isValidValue",
                actions: ["setPastedValue", "setLastValueFocusIndex"],
              },
              { actions: "resetFocusedValue" },
            ],
            BLUR: {
              target: "idle",
              actions: "clearFocusedIndex",
            },
            DELETE: {
              guard: "hasValue",
              actions: "clearFocusedValue",
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
                actions: "clearFocusedValue",
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
          const empty = Array.from({ length: inputs.length }).map(() => "")
          ctx.value = Object.assign(empty, ctx.value)
        },
        focusInput: (ctx) => {
          raf(() => {
            if (ctx.focusedIndex === -1) return
            dom.getFocusedEl(ctx)?.focus()
          })
        },
        setInputSelection: (ctx) => {
          raf(() => {
            if (ctx.focusedIndex === -1) return
            const input = dom.getFocusedEl(ctx)
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
          const inputs = dom.getElements(ctx)
          ctx.value.forEach((val, index) => {
            const input = inputs[index]
            input.value = val || ""
          })
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
          ctx.value[ctx.focusedIndex] = lastChar(evt.value)
        },
        dispatchInputEventIfNeeded: (ctx, evt) => {
          const valueIsChanged = lastChar(evt.value) !== ctx.focusedValue
          if (evt.value.length <= 1 || valueIsChanged) return

          const inputs = dom.getElements(ctx)
          const input = inputs[ctx.focusedIndex]
          input.value = lastChar(evt.value)
        },
        setPastedValue(ctx, evt) {
          raf(() => {
            const startIndex = ctx.focusedValue ? 1 : 0
            const value = evt.value.substring(startIndex, ctx.valueLength)
            assign(ctx, value)
          })
        },
        setValueAtIndex: (ctx, evt) => {
          ctx.value[evt.index] = lastChar(evt.value)
        },
        clearValue: (ctx) => {
          ctx.value = ctx.value.map(() => "")
        },
        clearFocusedValue: (ctx) => {
          ctx.value[ctx.focusedIndex] = ""
        },
        resetFocusedValue: (ctx) => {
          const input = dom.getFocusedEl(ctx)
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
            dom.getFocusedEl(ctx)?.blur()
          })
        },
        requestFormSubmit(ctx) {
          if (!ctx.name) return
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
  const valueArr = Array.isArray(value) ? value : value.split("").filter(Boolean)
  const valueObj = Object.assign({}, ctx.value, valueArr)
  ctx.value = Object.values(valueObj)
}

function lastChar(value: string) {
  return value.charAt(value.length - 1)
}
