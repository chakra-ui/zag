import { addPointerEvent } from "@core-dom/event/pointer"
import { NumericRange } from "@core-foundation/numeric-range"
import { nextTick, noop } from "@core-foundation/utils/fn"
import { createMachine, guards, preserve } from "@ui-machines/core"
import { getElements } from "./number-input.dom"
import { sanitize } from "./number-input.utils"

const { not, and } = guards

export type NumberInputMachineContext = {
  uid: string | number
  doc?: Document
  disabled?: boolean
  readonly?: boolean
  precision?: number
  value: string
  min: number
  max: number
  step: number
  allowMouseWheel?: boolean
  keepWithinRange?: boolean
  clampValueOnBlur?: boolean
  focusInputOnChange?: boolean
}

export type NumberInputMachineState = {
  value: "mounted" | "idle" | "increment:interval" | "decrement:interval" | "decrement" | "increment"
}

export const numberInputMachine = createMachine<NumberInputMachineContext, NumberInputMachineState>(
  {
    id: "number-input",
    initial: "mounted",
    context: {
      uid: "test-id",
      value: "",
      step: 1,
      min: Number.MIN_SAFE_INTEGER,
      max: Number.MAX_SAFE_INTEGER,
      allowMouseWheel: true,
    },
    states: {
      mounted: {
        on: {
          SETUP: {
            target: "idle",
            actions: ["setId", "setOwnerDocument"],
          },
        },
      },
      idle: {
        activities: "attachWheelListener",
        on: {
          INC: {
            actions: "incrementBy",
          },
          DEC: {
            actions: "decrementBy",
          },
          GO_TO_MAX: {
            actions: "setToMax",
          },
          GO_TO_MIN: {
            actions: "setToMin",
          },
          PRESS_DOWN_INC: {
            cond: not("isAtMax"),
            target: "increment",
            actions: "focusInput",
          },
          PRESS_DOWN_DEC: {
            cond: not("isAtMin"),
            target: "decrement",
            actions: "focusInput",
          },
          INPUT_CHANGE: {
            actions: "setValue",
          },
          INPUT_BLUR: {
            cond: and("shouldClampOnBlur", not("isInRange")),
            actions: "clampValue",
          },
        },
      },
      "increment:interval": {
        every: { CHANGE_INTERVAL: "increment" },
        on: {
          PRESS_UP_INC: "idle",
        },
      },
      "decrement:interval": {
        every: { CHANGE_INTERVAL: "decrement" },
        on: {
          PRESS_UP_DEC: "idle",
        },
      },
      increment: {
        entry: "increment",
        after: {
          CHANGE_DELAY: {
            target: "increment:interval",
            cond: "isInRange",
          },
        },
        on: {
          PRESS_UP_INC: "idle",
        },
      },
      decrement: {
        entry: "decrement",
        after: {
          CHANGE_DELAY: {
            target: "decrement:interval",
            cond: "isInRange",
          },
        },
        on: {
          PRESS_UP_DEC: "idle",
        },
      },
    },
  },
  {
    delays: {
      CHANGE_INTERVAL: 50,
      CHANGE_DELAY: 300,
    },
    guards: {
      shouldClampOnBlur: (ctx) => !!ctx.clampValueOnBlur,
      isAtMin: (ctx) => new NumericRange(ctx).isAtMin,
      isAtMax: (ctx) => new NumericRange(ctx).isAtMax,
      isInRange: (ctx) => new NumericRange(ctx).isInRange,
    },
    activities: {
      attachWheelListener(ctx) {
        const doc = ctx.doc ?? document
        const { input } = getElements(ctx)

        if (!input) return noop

        const listener = (event: WheelEvent) => {
          const isInputFocused = doc.activeElement === input
          if (!ctx.allowMouseWheel || !isInputFocused) return noop
          event.preventDefault()

          const dir = Math.sign(event.deltaY) * -1

          if (dir === 1) {
            ctx.value = new NumericRange(ctx).increment().clamp().toString()
          } else if (dir === -1) {
            ctx.value = new NumericRange(ctx).decrement().clamp().toString()
          }
        }
        return addPointerEvent(input, "wheel", listener, { passive: false })
      },
    },
    actions: {
      setId: (ctx, evt) => {
        ctx.uid = evt.id
      },
      setOwnerDocument(ctx, evt) {
        ctx.doc = preserve(evt.doc)
      },
      focusInput(ctx) {
        const { input } = getElements(ctx)
        nextTick(() => input?.focus())
      },
      increment(ctx) {
        ctx.value = new NumericRange(ctx).increment().clamp().toString()
      },
      decrement(ctx) {
        ctx.value = new NumericRange(ctx).decrement().clamp().toString()
      },
      clampValue(ctx) {
        ctx.value = new NumericRange(ctx).clamp().toString()
      },
      setValue(ctx, event) {
        ctx.value = sanitize(event.value)
      },
      setToMax(ctx) {
        ctx.value = ctx.max.toString()
      },
      setToMin(ctx) {
        ctx.value = ctx.min.toString()
      },
      incrementBy(ctx, evt) {
        ctx.value = new NumericRange(ctx).increment(evt.step).clamp().toString()
      },
      decrementBy(ctx, evt) {
        ctx.value = new NumericRange(ctx).decrement(evt.step).clamp().toString()
      },
    },
  },
)
