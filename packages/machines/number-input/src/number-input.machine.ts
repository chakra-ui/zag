import { choose, createMachine, guards, ref } from "@zag-js/core"
import { addDomEvent, observeAttributes, raf, requestPointerLock } from "@zag-js/dom-utils"
import { isAtMax, isAtMin, isWithinRange, valueOf } from "@zag-js/number-utils"
import { isSafari, pipe, supportsPointerEvent } from "@zag-js/utils"
import { dom } from "./number-input.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./number-input.types"
import { utils } from "./number-input.utils"

const { not, and } = guards

export function machine(ctx: UserDefinedContext = {}) {
  return createMachine<MachineContext, MachineState>(
    {
      id: "number-input",
      initial: "unknown",
      context: {
        uid: "",
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
        ...ctx,
        messages: {
          incrementLabel: "increment value",
          decrementLabel: "decrease value",
          ...ctx.messages,
        },
      },

      computed: {
        isRtl: (ctx) => ctx.dir === "rtl",
        valueAsNumber: (ctx) => valueOf(ctx.value),
        isAtMin: (ctx) => isAtMin(ctx.value, ctx),
        isAtMax: (ctx) => isAtMax(ctx.value, ctx),
        isOutOfRange: (ctx) => !isWithinRange(ctx.value, ctx),
        canIncrement: (ctx) => ctx.allowOverflow || !ctx.isAtMax,
        canDecrement: (ctx) => ctx.allowOverflow || !ctx.isAtMin,
        valueText: (ctx) => ctx.messages.valueText?.(ctx.value),
        formattedValue: (ctx) => ctx.format?.(ctx.value).toString() ?? ctx.value,
      },

      watch: {
        value: ["invokeOnChange"],
        isOutOfRange: ["invokeOnInvalid"],
      },

      on: {
        SET_VALUE: {
          actions: ["setValue", "setHintToSet"],
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
        unknown: {
          on: {
            SETUP: {
              target: "idle",
              actions: ["setupDocument", "syncInputValue"],
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
              actions: ["focusInput", "setHint", "setCursorPoint"],
            },
            FOCUS: "focused",
          },
        },

        focused: {
          tags: ["focus"],
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
                actions: ["clearValue", "clearHint"],
              },
              {
                guard: and("clampOnBlur", not("isInRange")),
                target: "idle",
                actions: ["clampValue", "clearHint"],
              },
              {
                target: "idle",
                actions: ["roundValue"],
              },
            ],
          },
        },

        "before:spin": {
          tags: ["focus"],
          entry: choose([
            { guard: "isIncrementHint", actions: "increment" },
            { guard: "isDecrementHint", actions: "decrement" },
          ]),
          after: {
            CHANGE_DELAY: {
              target: "spinning",
              guard: "isInRange",
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
          tags: ["focus"],
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
          tags: ["focus"],
          entry: ["addCustomCursor", "disableTextSelection"],
          exit: ["removeCustomCursor", "restoreTextSelection"],
          activities: ["activatePointerLock", "trackMousemove"],
          on: {
            POINTER_UP_SCRUBBER: {
              target: "focused",
              actions: ["clearCursorPoint"],
            },
            POINTER_MOVE_SCRUBBER: [
              {
                guard: "isIncrementHint",
                actions: ["increment", "setCursorPoint", "updateCursor"],
              },
              {
                guard: "isDecrementHint",
                actions: ["decrement", "setCursorPoint", "updateCursor"],
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
        isDecrementHint: (ctx, evt) => (evt.hint ?? ctx.hint) === "decrement",
        isIncrementHint: (ctx, evt) => (evt.hint ?? ctx.hint) === "increment",
        isInvalidExponential: (ctx) => ctx.value.toString().startsWith("e"),
      },

      activities: {
        trackButtonDisabled(ctx, _evt, { send }) {
          let btnEl: HTMLButtonElement | null = null
          if (ctx.hint === "increment") {
            btnEl = dom.getIncButtonEl(ctx)
          }
          if (ctx.hint === "decrement") {
            btnEl = dom.getDecButtonEl(ctx)
          }
          return observeAttributes(btnEl, "disabled", function onDisable() {
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
          if (isSafari() || !supportsPointerEvent()) return
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

          // prettier-ignore
          return pipe(
            addDomEvent(doc, "mousemove", onMousemove, false),
            addDomEvent(doc, "mouseup", onMouseup, false)
          )
        },
      },

      actions: {
        setupDocument: (ctx, evt) => {
          if (evt.doc) ctx.doc = ref(evt.doc)
          if (evt.root) ctx.rootNode = ref(evt.root)
          ctx.uid = evt.id
        },
        focusInput(ctx) {
          if (!ctx.focusInputOnChange) return
          const input = dom.getInputEl(ctx)
          raf(() => input?.focus())
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
        roundValue(ctx) {
          if (ctx.value !== "") {
            ctx.value = utils.round(ctx)
          }
        },
        setValue(ctx, evt) {
          const value = evt.target?.value ?? evt.value
          ctx.value = utils.sanitize(ctx, utils.parse(ctx, value))
        },
        clearValue(ctx) {
          ctx.value = ""
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

        invokeOnChange(ctx) {
          ctx.onChange?.({
            value: ctx.value,
            valueAsNumber: ctx.valueAsNumber,
          })
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
        // sync input value, in event it was set from form libraries via `ref`, `bind:this`, etc.
        syncInputValue(ctx) {
          const input = dom.getInputEl(ctx)
          if (!input || input.value == ctx.value) return
          const value = utils.parse(ctx, input.value)
          ctx.value = utils.sanitize(ctx, value)
        },
        setCursorPoint(ctx, evt) {
          ctx.scrubberCursorPoint = evt.point
        },
        clearCursorPoint(ctx) {
          ctx.scrubberCursorPoint = null
        },
        updateCursor(ctx) {
          const cursor = dom.getCursorEl(ctx)
          if (!cursor || !ctx.scrubberCursorPoint) return
          const { x, y } = ctx.scrubberCursorPoint
          cursor.style.transform = `translate3d(${x}px, ${y}px, 0px)`
        },
        addCustomCursor(ctx) {
          if (isSafari() || !supportsPointerEvent()) return
          dom.createVirtualCursor(ctx)
        },
        removeCustomCursor(ctx) {
          if (isSafari() || !supportsPointerEvent()) return
          dom.getCursorEl(ctx)?.remove()
        },
        disableTextSelection(ctx) {
          const doc = dom.getDoc(ctx)
          doc.body.style.pointerEvents = "none"
          doc.documentElement.style.userSelect = "none"
          doc.documentElement.style.cursor = "ew-resize"
        },
        restoreTextSelection(ctx) {
          const doc = dom.getDoc(ctx)
          doc.body.style.pointerEvents = ""
          doc.documentElement.style.userSelect = ""
          doc.documentElement.style.cursor = ""
        },
      },

      hookSync: true,
    },
  )
}
