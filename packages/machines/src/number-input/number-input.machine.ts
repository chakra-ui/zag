import { choose, createMachine, guards, ref } from "@ui-machines/core"
import { addDomEvent } from "tiny-dom-event"
import { nextTick, noop } from "tiny-fn"
import { add } from "tiny-point"
import { observeAttributes, uuid } from "../utils"
import { pipe } from "../utils/fn"
import { numericRange } from "../utils/number"
import { requestPointerLock } from "../utils/pointerlock"
import { dom } from "./number-input.dom"
import { NumberInputMachineContext, NumberInputMachineState } from "./number-input.types"
import { utils } from "./number-input.utils"

const { not, and } = guards

export const numberInputMachine = createMachine<NumberInputMachineContext, NumberInputMachineState>(
  {
    id: "number-input",
    initial: "unknown",
    context: {
      focusInputOnChange: true,
      clampValueOnBlur: true,
      keepWithinRange: true,
      inputMode: "decimal",
      pattern: "[0-9]*(.[0-9]+)?",
      hint: null,
      uid: uuid(),
      value: "",
      step: 1,
      min: Number.MIN_SAFE_INTEGER,
      max: Number.MAX_SAFE_INTEGER,
      inputSelection: null,
      scrubberPoint: null,
    },

    computed: {
      valueAsNumber: (ctx) => numericRange(ctx).getValueAsNumber(),
      isAtMin: (ctx) => numericRange(ctx).isAtMin(),
      isAtMax: (ctx) => numericRange(ctx).isAtMax(),
      isOutOfRange: (ctx) => !numericRange(ctx).isInRange(),
      canIncrement: (ctx) => !ctx.keepWithinRange || (!ctx.disabled && !numericRange(ctx).isAtMax()),
      canDecrement: (ctx) => !ctx.keepWithinRange || (!ctx.disabled && !numericRange(ctx).isAtMin()),
      ariaValueText: (ctx) => ctx.getAriaValueText?.(ctx.value) ?? ctx.value,
      formattedValue: (ctx) => ctx.format?.(ctx.value).toString() ?? ctx.value,
    },

    entry: ["syncInputValue"],

    watch: {
      value: ["invokeOnChange"],
      isOutOfRange: ["invokeOnInvalid"],
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
        on: {
          PRESS_DOWN: {
            target: "before:spin",
            actions: ["focusInput", "setHint"],
          },
          PRESS_DOWN_SCRUBBER: {
            target: "scrubbing",
            actions: ["focusInput", "setHint", "setScrubberPoint"],
          },
          FOCUS: "focused",
        },
      },

      focused: {
        activities: "attachWheelListener",
        on: {
          PRESS_DOWN: {
            target: "before:spin",
            actions: ["focusInput", "setHint"],
          },
          PRESS_DOWN_SCRUBBER: {
            target: "scrubbing",
            actions: ["focusInput", "setHint", "setScrubberPoint"],
          },
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
          CHANGE: {
            actions: ["setValue", "setSelectionRange", "setHint"],
          },
          BLUR: {
            target: "idle",
            cond: and("clampOnBlur", not("isInRange")),
            actions: ["clampValue", "clearHint"],
          },
        },
      },

      "before:spin": {
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
            target: "focused",
            actions: ["clearHint", "restoreSelection"],
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
            actions: ["clearHint", "restoreSelection"],
          },
        },
      },

      scrubbing: {
        activities: ["activatePointerLock", "trackMousemove"],
        on: {
          POINTER_UP_SCRUBBER: {
            target: "focused",
            actions: ["clearScrubberPoint"],
          },
          POINTER_MOVE_SCRUBBER: [
            {
              cond: "isIncrement",
              actions: ["increment", "setScrubberPoint"],
            },
            {
              cond: "isDecrement",
              actions: ["decrement", "setScrubberPoint"],
            },
          ],
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
      isAtMin: (ctx) => ctx.isAtMin,
      isAtMax: (ctx) => ctx.isAtMax,
      isInRange: (ctx) => !ctx.isOutOfRange,
      isDecrement: (ctx, evt) => (evt.hint ?? ctx.hint) === "decrement",
      isIncrement: (ctx, evt) => (evt.hint ?? ctx.hint) === "increment",
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

            function onWheel(event: WheelEvent) {
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
            cleanups.push(addDomEvent(input, "wheel", onWheel, { passive: false }))
          }),
        )

        return () => cleanups.forEach((c) => c())
      },
      activatePointerLock(ctx) {
        const pointerlock = requestPointerLock(dom.getDoc(ctx))
        pointerlock.setup()
        return pointerlock.dispose
      },
      trackMousemove(ctx, _evt, { send }) {
        return pipe(
          addDomEvent(
            dom.getDoc(ctx),
            "mousemove",
            function onMousemove(event) {
              if (!ctx.scrubberPoint) return
              const { movementX: x, movementY: y } = event
              const hint = x > 0 ? "increment" : x < 0 ? "decrement" : null
              const point = { ...add(ctx.scrubberPoint, { x, y }) }
              const width = dom.getWin(ctx).innerWidth
              point.x = (point.x + width) % width
              if (!hint) return
              send({ type: "POINTER_MOVE_SCRUBBER", hint, point })
            },
            false,
          ),
          addDomEvent(
            dom.getDoc(ctx),
            "mouseup",
            function onMouseup() {
              send("POINTER_UP_SCRUBBER")
            },
            false,
          ),
        )
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
        if (!ctx.focusInputOnChange) return
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
        const value = evt.target?.value ?? evt.value
        ctx.value = utils.sanitize(ctx, utils.parse(ctx, value))
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
      setSelectionRange(ctx, evt) {
        ctx.inputSelection = {
          start: evt.target.selectionStart,
          end: evt.target.selectionEnd,
        }
      },
      restoreSelection(ctx) {
        const input = dom.getInputEl(ctx)
        if (!input || !ctx.inputSelection) return
        input.selectionStart = ctx.inputSelection.start ?? input.value?.length
        input.selectionEnd = ctx.inputSelection.end ?? input.selectionStart
      },
      invokeOnChange(ctx) {
        ctx.onChange?.(ctx.value, ctx.valueAsNumber)
      },
      invokeOnInvalid(ctx) {
        if (!ctx.isOutOfRange) return
        const type = ctx.valueAsNumber > ctx.max ? "rangeOverflow" : "rangeUnderflow"
        ctx.onInvalid?.(type, ctx.formattedValue, ctx.valueAsNumber)
      },
      syncInputValue(ctx) {
        const input = dom.getInputEl(ctx)
        if (!input || input.value == ctx.value) return
        const value = utils.parse(ctx, input.value)
        ctx.value = utils.sanitize(ctx, value)
      },
      setScrubberPoint(ctx, evt) {
        ctx.scrubberPoint = evt.point
      },
      clearScrubberPoint(ctx) {
        ctx.scrubberPoint = null
      },
    },
  },
)
