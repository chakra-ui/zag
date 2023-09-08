import { choose, createMachine, guards } from "@zag-js/core"
import { addDomEvent, requestPointerLock } from "@zag-js/dom-event"
import { isSafari, raf } from "@zag-js/dom-query"
import { observeAttributes } from "@zag-js/mutation-observer"
import { isAtMax, isAtMin, isWithinRange, valueOf } from "@zag-js/number-utils"
import { callAll, compact, isEqual } from "@zag-js/utils"
import { dom } from "./number-input.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./number-input.types"
import { utils } from "./number-input.utils"

const { not, and } = guards

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "number-input",
      initial: "idle",
      context: {
        dir: "ltr",
        focusInputOnChange: true,
        clampValueOnBlur: true,
        allowOverflow: false,
        inputMode: "decimal",
        pattern: "[0-9]*(.[0-9]+)?",
        hint: null,
        value: "",
        step: 1,
        min: Number.MIN_SAFE_INTEGER,
        max: Number.MAX_SAFE_INTEGER,
        scrubberCursorPoint: null,
        invalid: false,
        spinOnPress: true,
        ...ctx,
        translations: {
          incrementLabel: "increment value",
          decrementLabel: "decrease value",
          ...ctx.translations,
        },
      },

      computed: {
        isRtl: (ctx) => ctx.dir === "rtl",
        valueAsNumber: (ctx) => valueOf(ctx.value),
        isAtMin: (ctx) => isAtMin(ctx.value, ctx),
        isAtMax: (ctx) => isAtMax(ctx.value, ctx),
        isOutOfRange: (ctx) => !isWithinRange(ctx.value, ctx),
        isValueEmpty: (ctx) => ctx.value === "",
        canIncrement: (ctx) => ctx.allowOverflow || !ctx.isAtMax,
        canDecrement: (ctx) => ctx.allowOverflow || !ctx.isAtMin,
        valueText: (ctx) => ctx.translations.valueText?.(ctx.value),
        formattedValue: (ctx) => ctx.format?.(ctx.value).toString() ?? ctx.value,
      },

      watch: {
        value: ["syncInputElement"],
        isOutOfRange: ["invokeOnInvalid"],
        scrubberCursorPoint: ["setVirtualCursorPosition"],
      },

      entry: ["syncInputValue"],

      on: {
        SET_VALUE: {
          actions: ["setValue", "clampValue", "setHintToSet"],
        },
        CLEAR_VALUE: {
          actions: ["clearValue"],
        },
        INCREMENT: {
          actions: ["increment"],
        },
        DECREMENT: {
          actions: ["decrement"],
        },
      },

      states: {
        idle: {
          on: {
            PRESS_DOWN: {
              target: "before:spin",
              actions: ["focusInput", "invokeOnFocus", "setHint"],
            },
            PRESS_DOWN_SCRUBBER: {
              target: "scrubbing",
              actions: ["focusInput", "invokeOnFocus", "setHint", "setCursorPoint"],
            },
            FOCUS: {
              target: "focused",
              actions: ["focusInput", "invokeOnFocus"],
            },
          },
        },

        focused: {
          tags: "focus",
          entry: "focusInput",
          activities: "attachWheelListener",
          on: {
            PRESS_DOWN: {
              target: "before:spin",
              actions: ["focusInput", "setHint"],
            },
            PRESS_DOWN_SCRUBBER: {
              target: "scrubbing",
              actions: ["focusInput", "setHint", "setCursorPoint"],
            },
            ARROW_UP: {
              actions: "increment",
            },
            ARROW_DOWN: {
              actions: "decrement",
            },
            HOME: {
              actions: "setToMin",
            },
            END: {
              actions: "setToMax",
            },
            CHANGE: {
              actions: ["setValue", "setHint"],
            },
            BLUR: [
              {
                guard: "isInvalidExponential",
                target: "idle",
                actions: ["clearValue", "clearHint", "invokeOnBlur"],
              },
              {
                guard: and("clampOnBlur", not("isInRange"), not("isEmptyValue")),
                target: "idle",
                actions: ["clampValue", "clearHint", "invokeOnBlur"],
              },
              {
                target: "idle",
                actions: ["roundValue", "invokeOnBlur"],
              },
            ],
          },
        },

        "before:spin": {
          tags: "focus",
          activities: "trackButtonDisabled",
          entry: choose([
            { guard: "isIncrementHint", actions: "increment" },
            { guard: "isDecrementHint", actions: "decrement" },
          ]),
          after: {
            CHANGE_DELAY: {
              target: "spinning",
              guard: and("isInRange", "spinOnPress"),
            },
          },
          on: {
            PRESS_UP: {
              target: "focused",
              actions: "clearHint",
            },
          },
        },

        spinning: {
          tags: "focus",
          activities: "trackButtonDisabled",
          every: [
            {
              delay: "CHANGE_INTERVAL",
              guard: and(not("isAtMin"), "isIncrementHint"),
              actions: "increment",
            },
            {
              delay: "CHANGE_INTERVAL",
              guard: and(not("isAtMax"), "isDecrementHint"),
              actions: "decrement",
            },
          ],
          on: {
            PRESS_UP: {
              target: "focused",
              actions: "clearHint",
            },
          },
        },

        scrubbing: {
          tags: "focus",
          exit: "clearCursorPoint",
          activities: ["activatePointerLock", "trackMousemove", "setupVirtualCursor", "preventTextSelection"],
          on: {
            POINTER_UP_SCRUBBER: "focused",
            POINTER_MOVE_SCRUBBER: [
              {
                guard: "isIncrementHint",
                actions: ["increment", "setCursorPoint"],
              },
              {
                guard: "isDecrementHint",
                actions: ["decrement", "setCursorPoint"],
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
        spinOnPress: (ctx) => !!ctx.spinOnPress,
        isAtMax: (ctx) => ctx.isAtMax,
        isInRange: (ctx) => !ctx.isOutOfRange,
        isDecrementHint: (ctx, evt) => (evt.hint ?? ctx.hint) === "decrement",
        isEmptyValue: (ctx) => ctx.isValueEmpty,
        isIncrementHint: (ctx, evt) => (evt.hint ?? ctx.hint) === "increment",
        isInvalidExponential: (ctx) => ctx.value.toString().startsWith("e"),
      },

      activities: {
        setupVirtualCursor(ctx) {
          return dom.setupVirtualCursor(ctx)
        },
        preventTextSelection(ctx) {
          return dom.preventTextSelection(ctx)
        },
        trackButtonDisabled(ctx, _evt, { send }) {
          const btn = dom.getPressedTriggerEl(ctx, ctx.hint)
          return observeAttributes(btn, ["disabled"], () => {
            send("PRESS_UP")
          })
        },
        attachWheelListener(ctx, _evt, { send }) {
          const input = dom.getInputEl(ctx)
          if (!input) return

          function onWheel(event: WheelEvent) {
            const isInputFocused = dom.getDoc(ctx).activeElement === input
            if (!ctx.allowMouseWheel || !isInputFocused) return
            event.preventDefault()

            const dir = Math.sign(event.deltaY) * -1
            if (dir === 1) {
              send("INCREMENT")
            } else if (dir === -1) {
              send("DECREMENT")
            }
          }
          return addDomEvent(input, "wheel", onWheel, { passive: false })
        },
        activatePointerLock(ctx) {
          if (isSafari()) return
          return requestPointerLock(dom.getDoc(ctx))
        },
        trackMousemove(ctx, _evt, { send }) {
          const doc = dom.getDoc(ctx)

          function onMousemove(event: MouseEvent) {
            if (!ctx.scrubberCursorPoint) return
            const value = dom.getMousementValue(ctx, event)
            if (!value.hint) return
            send({
              type: "POINTER_MOVE_SCRUBBER",
              hint: value.hint,
              point: value.point,
            })
          }

          function onMouseup() {
            send("POINTER_UP_SCRUBBER")
          }

          return callAll(
            addDomEvent(doc, "mousemove", onMousemove, false),
            addDomEvent(doc, "mouseup", onMouseup, false),
          )
        },
      },

      actions: {
        focusInput(ctx) {
          if (!ctx.focusInputOnChange) return
          const inputEl = dom.getInputEl(ctx)
          raf(() => {
            inputEl?.focus()
          })
        },
        increment(ctx, evt) {
          set.value(ctx, utils.increment(ctx, evt.step))
        },
        decrement(ctx, evt) {
          set.value(ctx, utils.decrement(ctx, evt.step))
        },
        clampValue(ctx) {
          set.value(ctx, utils.clamp(ctx))
        },
        roundValue(ctx) {
          if (ctx.value === "") return
          set.value(ctx, utils.round(ctx))
        },
        setValue(ctx, evt) {
          let value = evt.target?.value ?? evt.value
          value = utils.sanitize(ctx, utils.parse(ctx, value.toString()))
          set.value(ctx, value)
        },
        clearValue(ctx) {
          set.value(ctx, "")
        },
        setToMax(ctx) {
          set.value(ctx, ctx.max.toString())
        },
        setToMin(ctx) {
          set.value(ctx, ctx.min.toString())
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
        invokeOnFocus(ctx, evt) {
          let srcElement: HTMLElement | null = null

          if (evt.type === "PRESS_DOWN") {
            srcElement = dom.getPressedTriggerEl(ctx, evt.hint)
          } else if (evt.type === "FOCUS") {
            srcElement = dom.getInputEl(ctx)
          } else if (evt.type === "PRESS_DOWN_SCRUBBER") {
            srcElement = dom.getScrubberEl(ctx)
          }

          ctx.onFocus?.({
            value: ctx.value,
            valueAsNumber: ctx.valueAsNumber,
            srcElement,
          })
        },
        invokeOnBlur(ctx) {
          ctx.onBlur?.({ value: ctx.value, valueAsNumber: ctx.valueAsNumber })
        },
        invokeOnInvalid(ctx) {
          if (!ctx.isOutOfRange) return
          const reason = ctx.valueAsNumber > ctx.max ? "rangeOverflow" : "rangeUnderflow"
          ctx.onInvalid?.({
            reason,
            value: ctx.formattedValue,
            valueAsNumber: ctx.valueAsNumber,
          })
        },
        syncInputElement(ctx) {
          const inputEl = dom.getInputEl(ctx)
          dom.setValue(inputEl, ctx.formattedValue)
        },
        syncInputValue(ctx) {
          const inputEl = dom.getInputEl(ctx)
          if (!inputEl || inputEl.value == ctx.value) return

          const value = utils.parse(ctx, inputEl.value)
          set.value(ctx, utils.sanitize(ctx, value))
        },
        setCursorPoint(ctx, evt) {
          ctx.scrubberCursorPoint = evt.point
        },
        clearCursorPoint(ctx) {
          ctx.scrubberCursorPoint = null
        },
        setVirtualCursorPosition(ctx) {
          const cursor = dom.getCursorEl(ctx)
          if (!cursor || !ctx.scrubberCursorPoint) return
          const { x, y } = ctx.scrubberCursorPoint
          cursor.style.transform = `translate3d(${x}px, ${y}px, 0px)`
        },
      },
    },
  )
}

const invoke = {
  onChange: (ctx: MachineContext) => {
    ctx.onChange?.({ value: ctx.value, valueAsNumber: ctx.valueAsNumber })
  },
}

const set = {
  value: (ctx: MachineContext, value: string) => {
    if (isEqual(ctx.value, value)) return
    ctx.value = value
    invoke.onChange(ctx)
  },
}
