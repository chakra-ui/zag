import { createMachine, guards, preserve } from "@ui-machines/core"
import { nextTick } from "@core-foundation/utils/fn"
import { ArrayList } from "@core-foundation/array-list"
import { WithDOM } from "../utils/types"
import { dom } from "./pin-input.dom"

const { not } = guards

export type PinInputMachineContext = WithDOM<{
  disabled?: boolean
  direction?: "ltr" | "rtl"
  placeholder?: string
  autoFocus?: boolean
  invalid?: boolean
  otp?: boolean
  value: string[]
  type?: "alphanumeric" | "number"
  focusedIndex: number
  onComplete?(values: string[]): void
}>

export type PinInputMachineState = {
  value: "mounted" | "idle" | "focused"
}

export const pinInputMachine = createMachine<PinInputMachineContext, PinInputMachineState>(
  {
    id: "pin-input",
    initial: "mounted",
    context: {
      uid: "pin-input",
      value: [],
      focusedIndex: -1,
    },
    states: {
      mounted: {
        on: {
          SETUP: {
            target: "idle",
            actions: ["setId", "setOwnerDocument", "setInitialValue", "autoFocus"],
          },
        },
      },
      idle: {
        on: {
          CLEAR: {
            actions: ["clearValue", "setFocusIndexToFirst", "focusInput"],
          },
          FOCUS: {
            target: "focused",
            actions: "setFocusedIndex",
          },
        },
      },
      focused: {
        on: {
          TYPE: [
            {
              cond: "isLastValueBeforeComplete",
              actions: ["setValue", "invokeComplete"],
            },
            {
              cond: "isEventValueEmpty",
              actions: "setValue",
            },
            {
              cond: not("isLastInputFocused"),
              actions: ["setValue", "setNextFocusedIndex", "focusInput"],
            },
          ],
          BLUR: {
            target: "idle",
            actions: "resetFocusedIndex",
          },
          BACKSPACE: [
            {
              cond: "hasValue",
              actions: "clearValueAtFocusedIndex",
            },
            {
              actions: ["setPrevFocusIndex", "clearValueAtFocusedIndex", "focusInput"],
            },
          ],
        },
      },
    },
  },
  {
    guards: {
      isEventValueEmpty: (ctx, evt) => {
        return evt.value === "" && !!ctx.value[ctx.focusedIndex + 1]
      },
      hasValue: (ctx) => {
        return Boolean(ctx.value[ctx.focusedIndex])
      },
      isValueComplete: (ctx) => {
        return ctx.value.every(Boolean)
      },
      isLastValueBeforeComplete: (ctx) => {
        const inputs = dom(ctx)
        return ctx.value.filter(Boolean).length === inputs.size - 1
      },
      isLastInputFocused: (ctx) => {
        const inputs = dom(ctx)
        return ctx.focusedIndex === inputs.size - 1
      },
    },
    actions: {
      setId: (ctx, evt) => {
        ctx.uid = evt.id
      },
      setInitialValue: (ctx) => {
        nextTick(() => {
          const inputs = dom(ctx)
          const empty = ArrayList.fromLength(inputs.size, () => "")
          ctx.value = ctx.value.length === 0 ? preserve(empty.value as string[]) : ctx.value
        })
      },
      setOwnerDocument: (ctx, evt) => {
        ctx.doc = preserve(evt.doc)
      },
      focusInput: (ctx) => {
        nextTick(() => {
          const inputs = dom(ctx)
          const input = inputs.at(ctx.focusedIndex)
          input.focus()
        })
      },
      invokeComplete: (ctx) => {
        ctx.onComplete?.(ctx.value)
      },
      resetFocusedIndex: (ctx) => {
        ctx.focusedIndex = -1
      },
      setFocusedIndex: (ctx, event) => {
        ctx.focusedIndex = event.index
      },
      setValue: (ctx, event) => {
        let eventValue = String(event.value)

        // handles pasting scenarios
        if (event.value.length > 2) {
          const clipboardData = eventValue.split("").filter((_, index) => index < ctx.value.length)

          ctx.value = clipboardData

          if (clipboardData.length === ctx.value.length) {
            ctx.onComplete?.(clipboardData)
          }
        } else {
          ctx.value[ctx.focusedIndex] = eventValue.length > 1 ? eventValue.charAt(1) : eventValue.charAt(0)
        }
      },
      clearValue: (ctx) => {
        ctx.value = ctx.value.map(() => "")
      },
      clearValueAtFocusedIndex: (ctx) => {
        ctx.value[ctx.focusedIndex] = ""
      },
      setFocusIndexToFirst: (ctx) => {
        ctx.focusedIndex = 0
      },
      autoFocus: (ctx) => {
        if (!ctx.autoFocus) return
        ctx.focusedIndex = 0
        nextTick(() => {
          const inputs = dom(ctx)
          inputs.first?.focus()
        })
      },
      setNextFocusedIndex: (ctx, evt, { guards }) => {
        if (guards?.isValueComplete(ctx, evt)) return
        const inputs = dom(ctx)
        ctx.focusedIndex = inputs.nextIndex(ctx.focusedIndex, 1, false)
      },
      setPrevFocusIndex: (ctx) => {
        const inputs = dom(ctx)
        ctx.focusedIndex = inputs.prevIndex(ctx.focusedIndex, 1, false)
      },
    },
  },
)
