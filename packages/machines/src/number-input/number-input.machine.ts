import { choose, createMachine, guards, ref } from "@ui-machines/core"
import { addDomEvent } from "tiny-dom-event"
import { nextTick, noop } from "tiny-fn"
import { range as createRange } from "tiny-num"
import { observeAttributes, uuid } from "../utils"
import { dom } from "./number-input.dom"
import { utils } from "./number-input.utils"

const { not, and } = guards

export type NumberInputMachineContext = {
  uid: string | number
  doc?: Document
  disabled?: boolean
  readonly?: boolean
  precision?: number
  pattern: string
  value: string
  min: number
  max: number
  step: number
  allowMouseWheel?: boolean
  keepWithinRange?: boolean
  clampValueOnBlur?: boolean
  focusInputOnChange?: boolean
  hint: "increment" | "decrement" | "set" | null
}

export type NumberInputMachineState = {
  value: "unknown" | "idle" | "spinning" | "invoke" | "scrubbing"
}

export const numberInputMachine = createMachine<NumberInputMachineContext, NumberInputMachineState>(
  {
    id: "number-input",
    initial: "unknown",
    context: {
      pattern: "[0-9]*(.[0-9]+)?",
      hint: null,
      uid: uuid(),
      value: "",
      step: 1,
      min: Number.MIN_SAFE_INTEGER,
      max: Number.MAX_SAFE_INTEGER,
      allowMouseWheel: true,
    },

    on: {
      SET_VALUE: {
        actions: ["setValue", "setHintToSet"],
      },
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
          ARROW_UP: {
            actions: "increment",
          },
          ARROW_DOWN: {
            actions: "decrement",
          },
          HOME: {
            actions: "setToMax",
          },
          END: {
            actions: "setToMin",
          },
          PRESS_DOWN: {
            target: "invoke",
            actions: ["focusInput", "setHint"],
          },
          PRESS_DOWN_SCRUB: {
            target: "scrubbing",
            actions: ["focusInput", "setHint", "setCursorPoint"],
          },
          CHANGE: {
            actions: ["setValue", "setHint"],
          },
          BLUR: {
            cond: and("clampOnBlur", not("isInRange")),
            actions: ["clampValue", "clearHint"],
          },
        },
      },

      invoke: {
        entry: choose([
          { cond: "isIncrement", actions: "increment" },
          { cond: "isDecrement", actions: "decrement" },
        ]),
        after: {
          CHANGE_DELAY: {
            target: "spinning",
            cond: "isInRange",
          },
        },
        on: {
          PRESS_UP: {
            target: "idle",
            actions: ["clearHint"],
          },
        },
      },

      spinning: {
        activities: "trackButtonDisabled",
        every: [
          {
            delay: "CHANGE_INTERVAL",
            cond: and(not("isAtMin"), "isIncrement"),
            actions: "increment",
          },
          {
            delay: "CHANGE_INTERVAL",
            cond: and(not("isAtMax"), "isDecrement"),
            actions: "decrement",
          },
        ],
        on: {
          PRESS_UP: {
            target: "idle",
            actions: ["clearHint"],
          },
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
      clampOnBlur: (ctx) => !!ctx.clampValueOnBlur,
      isAtMin: (ctx) => createRange(ctx).isAtMin,
      isAtMax: (ctx) => createRange(ctx).isAtMax,
      isInRange: (ctx) => createRange(ctx).isInRange,
      isDecrement: (ctx) => ctx.hint === "decrement",
      isIncrement: (ctx) => ctx.hint === "increment",
    },
    activities: {
      trackButtonDisabled(ctx, _evt, { send }) {
        let btnEl: HTMLButtonElement | null = null
        if (ctx.hint === "increment") btnEl = dom.getIncButtonEl(ctx)
        if (ctx.hint === "decrement") dom.getDecButtonEl(ctx)
        return observeAttributes(btnEl, "disabled", () => {
          send("PRESS_UP")
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
      setValue(ctx, evt) {
        ctx.value = utils.sanitize(evt.value)
      },
      setToMax(ctx) {
        ctx.value = ctx.max.toString()
      },
      setToMin(ctx) {
        ctx.value = ctx.min.toString()
      },
      setHint(ctx, evt) {
        ctx.hint = evt.hint
      },
      clearHint(ctx) {
        ctx.hint = null
      },
      setHintToSet(ctx) {
        ctx.hint = "set"
      },
    },
  },
)
