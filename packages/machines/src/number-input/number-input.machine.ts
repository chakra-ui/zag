import { createMachine, guards, ref } from "@ui-machines/core"
import { addDomEvent } from "tiny-dom-event"
import { nextTick, noop } from "tiny-fn"
import { range as createRange } from "tiny-num"
import { observeAttributes } from "../utils"
import { dom } from "./number-input.dom"
import { utils } from "./number-input.utils"

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
  value: "unknown" | "idle" | "increment:interval" | "decrement:interval" | "decrement" | "increment"
}

export const numberInputMachine = createMachine<NumberInputMachineContext, NumberInputMachineState>(
  {
    id: "number-input",
    initial: "unknown",
    context: {
      uid: "test-id",
      value: "",
      step: 1,
      min: Number.MIN_SAFE_INTEGER,
      max: Number.MAX_SAFE_INTEGER,
      allowMouseWheel: true,
    },
    states: {
      unknown: {
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
            actions: "increment",
          },
          DEC: {
            actions: "decrement",
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
        activities: "trackIncButtonDisabled",
        every: { CHANGE_INTERVAL: "increment" },
        on: {
          PRESS_UP_INC: "idle",
        },
      },
      "decrement:interval": {
        activities: "trackDecButtonDisabled",
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
      isAtMin: (ctx) => createRange(ctx).isAtMin,
      isAtMax: (ctx) => createRange(ctx).isAtMax,
      isInRange: (ctx) => createRange(ctx).isInRange,
    },
    activities: {
      trackIncButtonDisabled(ctx, _evt, { send }) {
        return observeAttributes(dom.getIncButtonEl(ctx), "disabled", () => {
          send("PRESS_UP_INC")
        })
      },
      trackDecButtonDisabled(ctx, _evt, { send }) {
        return observeAttributes(dom.getDecButtonEl(ctx), "disabled", () => {
          send("PRESS_UP_DEC")
        })
      },
      attachWheelListener(ctx) {
        const cleanups: VoidFunction[] = []
        cleanups.push(
          nextTick(() => {
            const input = dom.getInputEl(ctx)
            if (!input) return noop

            const listener = (event: WheelEvent) => {
              const isInputFocused = dom.getDoc(ctx).activeElement === input
              if (!ctx.allowMouseWheel || !isInputFocused) return noop
              event.preventDefault()

              const dir = Math.sign(event.deltaY) * -1
              if (dir === 1) {
                ctx.value = utils.increment(ctx)
              } else if (dir === -1) {
                ctx.value = utils.decrement(ctx)
              }
            }
            cleanups.push(addDomEvent(input, "wheel", listener, { passive: false }))
          }),
        )

        return () => cleanups.forEach((c) => c())
      },
    },
    actions: {
      setId: (ctx, evt) => {
        ctx.uid = evt.id
      },
      setOwnerDocument(ctx, evt) {
        ctx.doc = ref(evt.doc)
      },
      focusInput(ctx) {
        const input = dom.getInputEl(ctx)
        nextTick(() => input?.focus())
      },
      increment(ctx, evt) {
        ctx.value = utils.increment(ctx, evt.step)
      },
      decrement(ctx, evt) {
        ctx.value = utils.decrement(ctx, evt.step)
      },
      clampValue(ctx) {
        ctx.value = utils.clamp(ctx)
      },
      setValue(ctx, event) {
        ctx.value = utils.sanitize(event.value)
      },
      setToMax(ctx) {
        ctx.value = ctx.max.toString()
      },
      setToMin(ctx) {
        ctx.value = ctx.min.toString()
      },
    },
  },
)
