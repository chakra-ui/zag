import { createMachine, guards } from "@zag-js/core"
import { nextTick, raf } from "@zag-js/dom-utils"
import { fromLength } from "@zag-js/utils"
import { dom } from "./pin-input.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./pin-input.types"

const { and, not } = guards

export function machine(ctx: UserDefinedContext) {
  return createMachine<MachineContext, MachineState>(
    {
      id: "pin-input",
      initial: "unknown",
      context: {
        value: [],
        focusedIndex: -1,
        placeholder: "○",
        otp: false,
        type: "numeric",
        ...ctx,
        messages: {
          inputLabel: (index, length) => `pin code ${index + 1} of ${length}`,
          ...ctx.messages,
        },
      },

      computed: {
        valueLength: (ctx) => ctx.value.length,
        filledValueLength: (ctx) => ctx.value.filter((v) => v?.trim() !== "").length,
        isValueComplete: (ctx) => ctx.valueLength === ctx.filledValueLength,
        valueAsString: (ctx) => ctx.value.join(""),
      },

      watch: {
        focusedIndex: "focusInput",
        value: "invokeOnChange",
        isValueComplete: ["invokeComplete", "blurFocusedInputIfNeeded"],
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

      states: {
        unknown: {
          on: {
            SETUP: [
              {
                guard: "autoFocus",
                target: "focused",
                actions: ["setupValue", "setFocusIndexToFirst"],
              },
              {
                target: "idle",
                actions: "setupValue",
              },
            ],
          },
        },
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
                actions: "setFocusedValue",
              },
              {
                guard: "isValidValue",
                actions: ["setFocusedValue", "setNextFocusedIndex"],
              },
            ],
            PASTE: {
              guard: "isValidValue",
              actions: ["setPastedValue", "setLastValueFocusIndex"],
            },
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
        isValidValue: (ctx, evt) => isValidType(evt.value, ctx.type),
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
          nextTick(() => {
            const inputs = dom.getElements(ctx)
            const empty = fromLength(inputs.length).map(() => "")
            ctx.value = Object.assign(empty, ctx.value)
          })
        },
        focusInput: (ctx) => {
          raf(() => {
            if (ctx.focusedIndex === -1) return
            dom.getFocusedEl(ctx)?.focus()
          })
        },
        invokeComplete: (ctx) => {
          if (ctx.isValueComplete) {
            ctx.onComplete?.({ value: Array.from(ctx.value), valueAsString: ctx.valueAsString })
          }
        },
        invokeOnChange: (ctx, evt) => {
          if (evt.type !== "SETUP") {
            ctx.onChange?.({ value: Array.from(ctx.value) })
          }
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
        setPastedValue(ctx, evt) {
          raf(() => {
            const value = evt.value.substring(0, ctx.valueLength)
            assign(ctx, value.split("").filter(Boolean))
          })
        },
        setValueAtIndex: (ctx, evt) => {
          ctx.value[evt.index] = lastChar(evt.value)
        },
        clearValue: (ctx) => {
          assign(ctx, "")
        },
        clearFocusedValue: (ctx) => {
          ctx.value[ctx.focusedIndex] = ""
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
  const len = ctx.value.length
  for (let i = 0; i < len; i++) {
    if (Array.isArray(value)) {
      if (!value[i]) continue
      ctx.value[i] = value[i]
    } else {
      ctx.value[i] = value
    }
  }
}

function lastChar(value: string) {
  return value.charAt(value.length - 1)
}
