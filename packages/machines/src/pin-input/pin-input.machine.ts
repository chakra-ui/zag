import { createMachine, ref, guards } from "@ui-machines/core"
import { fromLength } from "tiny-array"
import { nextTick } from "tiny-fn"
import { dom } from "./pin-input.dom"
import { PinInputMachineContext, PinInputMachineState } from "./pin-input.types"

const { and } = guards

export const pinInputMachine = createMachine<PinInputMachineContext, PinInputMachineState>(
  {
    id: "pin-input",
    initial: "unknown",
    context: {
      uid: "pin-input",
      value: [],
      focusedIndex: -1,
      placeholder: "○",
      otp: false,
      type: "numeric",
    },

    on: {
      SET_VALUE: [
        {
          guard: "hasIndex",
          actions: "setValueAtIndex",
        },
        { actions: "setValue" },
      ],
      CLEAR_VALUE: {
        actions: ["clearValue", "setFocusIndexToFirst"],
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
      isValueComplete: "invokeComplete",
    },

    states: {
      unknown: {
        on: {
          SETUP: [
            {
              guard: "autoFocus",
              target: "focused",
              actions: ["setId", "setOwnerDocument", "setupValue", "setFocusIndexToFirst"],
            },
            {
              target: "idle",
              actions: ["setId", "setOwnerDocument", "setupValue"],
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
              guard: and("hasValue", "isValidValue"),
              actions: ["replaceFocusedValue", "setNextFocusedIndex"],
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
    },
    actions: {
      setId: (ctx, evt) => {
        ctx.uid = evt.id
      },
      setOwnerDocument: (ctx, evt) => {
        ctx.doc = ref(evt.doc)
      },
      setupValue: (ctx) => {
        nextTick(() => {
          const inputs = dom.getElements(ctx)
          const empty = fromLength(inputs.length).map(() => "")
          ctx.value = Object.assign(empty, ctx.value)
        })
      },
      focusInput: (ctx) => {
        nextTick(() => {
          if (ctx.focusedIndex === -1) return
          dom.getFocusedEl(ctx)?.focus()
        })
      },
      invokeComplete: (ctx) => {
        if (ctx.isValueComplete) {
          ctx.onComplete?.(Array.from(ctx.value), ctx.valueAsString)
        }
      },
      invokeOnChange: (ctx, evt) => {
        if (evt.type !== "SETUP") {
          ctx.onChange?.(Array.from(ctx.value))
        }
      },
      clearFocusedIndex: (ctx) => {
        ctx.focusedIndex = -1
      },
      setValue: (ctx, event) => {
        assign(ctx, event.value)
      },
      setFocusedIndex: (ctx, event) => {
        ctx.focusedIndex = event.index
      },
      setFocusedValue: (ctx, event) => {
        ctx.value[ctx.focusedIndex] = event.value
      },
      replaceFocusedValue: (ctx, evt) => {
        const val = ctx.value[ctx.focusedIndex]
        ctx.value[ctx.focusedIndex] = evt.value.replace(val, "").charAt(0)
      },
      setPastedValue(ctx, evt) {
        nextTick(() => {
          const value = (evt.value as string).substr(0, ctx.valueLength)
          assign(ctx, value.split("").filter(Boolean))
        })
      },
      setValueAtIndex: (ctx, evt) => {
        ctx.value[evt.index] = evt.value
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
        nextTick(() => {
          ctx.focusedIndex = Math.min(ctx.filledValueLength, ctx.valueLength - 1)
        })
      },
    },
  },
)

const REGEX = {
  numeric: /^[0-9]+$/,
  alphabetic: /^[A-Za-z]+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/i,
}

function isValidType(value: string, type: PinInputMachineContext["type"]) {
  if (!type) return true
  return REGEX[type].test(value)
}

function assign(ctx: PinInputMachineContext, value: string | string[]) {
  for (let i = 0; i < ctx.value.length; i++) {
    if (Array.isArray(value)) {
      if (!value[i]) continue
      ctx.value[i] = value[i]
    } else {
      ctx.value[i] = value
    }
  }
}
