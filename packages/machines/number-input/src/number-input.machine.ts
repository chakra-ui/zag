import { choose, createMachine, guards, ref } from "@ui-machines/core"
import { addDomEvent, nextTick, observeAttributes, requestPointerLock } from "@ui-machines/dom-utils"
import { isAtMax, isAtMin, isWithinRange, valueOf } from "@ui-machines/number-utils"
import { isSafari, pipe, supportsPointerEvent } from "@ui-machines/utils"
import { dom } from "./number-input.dom"
import { MachineContext, MachineState } from "./number-input.types"
import { utils } from "./number-input.utils"

const { not, and } = guards

export const machine = createMachine<MachineContext, MachineState>(
  {
    id: "number-input",
    initial: "unknown",
    context: {
      uid: "",
      focusInputOnChange: true,
      clampValueOnBlur: true,
      keepWithinRange: true,
      inputMode: "decimal",
      pattern: "[0-9]*(.[0-9]+)?",
      hint: null,
      value: "",
      step: 1,
      min: Number.MIN_SAFE_INTEGER,
      max: Number.MAX_SAFE_INTEGER,
      precision: 0,
      inputSelection: null,
      cursorPoint: null,
      invalid: false,
      dir: "ltr",
    },

    computed: {
      isRtl: (ctx) => ctx.dir === "rtl",
      valueAsNumber: (ctx) => valueOf(ctx.value),
      isAtMin: (ctx) => isAtMin(ctx.value, ctx),
      isAtMax: (ctx) => isAtMax(ctx.value, ctx),
      isOutOfRange: (ctx) => !isWithinRange(ctx.value, ctx),
      canIncrement: (ctx) => !ctx.keepWithinRange || (!ctx.disabled && !ctx.isAtMax),
      canDecrement: (ctx) => !ctx.keepWithinRange || (!ctx.disabled && !ctx.isAtMin),
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
            actions: "setupDocument",
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
            actions: ["setValue", "setSelectionRange", "setHint"],
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
          ],
        },
      },

      "before:spin": {
        entry: choose([
          { guard: "canIncrement", actions: "increment" },
          { guard: "canDecrement", actions: "decrement" },
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
            actions: ["clearHint", "restoreSelection"],
          },
        },
      },

      spinning: {
        activities: "trackButtonDisabled",
        every: [
          {
            delay: "CHANGE_INTERVAL",
            guard: and([not("isAtMin"), "canIncrement"]),
            actions: "increment",
          },
          {
            delay: "CHANGE_INTERVAL",
            guard: and([not("isAtMax"), "canDecrement"]),
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
              guard: "canIncrement",
              actions: ["increment", "setCursorPoint", "updateCursor"],
            },
            {
              guard: "canDecrement",
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
      canDecrement: (ctx, evt) => (evt.hint ?? ctx.hint) === "decrement",
      canIncrement: (ctx, evt) => (evt.hint ?? ctx.hint) === "increment",
      isInvalidExponential: (ctx) => ctx.value.startsWith("e"),
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
            if (!input) return

            function onWheel(event: WheelEvent) {
              const isInputFocused = dom.getDoc(ctx).activeElement === input
              if (!ctx.allowMouseWheel || !isInputFocused) return
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
        if (isSafari() || !supportsPointerEvent()) return
        return requestPointerLock(dom.getDoc(ctx))
      },
      trackMousemove(ctx, _evt, { send }) {
        return pipe(
          addDomEvent(
            dom.getDoc(ctx),
            "mousemove",
            function onMousemove(event) {
              if (!ctx.cursorPoint) return
              const value = dom.getMousementValue(ctx, event)
              if (!value.hint) return
              send({ type: "POINTER_MOVE_SCRUBBER", hint: value.hint, point: value.point })
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
      setupDocument: (ctx, evt) => {
        ctx.doc = ref(evt.doc)
        ctx.uid = evt.id
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
      setCursorPoint(ctx, evt) {
        ctx.cursorPoint = evt.point
      },
      clearCursorPoint(ctx) {
        ctx.cursorPoint = null
      },
      updateCursor(ctx) {
        const cursor = dom.getCursorEl(ctx)
        if (!cursor || !ctx.cursorPoint) return
        cursor.style.transform = `translate3d(${ctx.cursorPoint.x}px, ${ctx.cursorPoint.y}px, 0px)`
      },
      addCustomCursor(ctx) {
        if (isSafari() || !supportsPointerEvent()) return
        const doc = dom.getDoc(ctx)
        const el = doc.createElement("div")
        el.className = "scrubber--cursor"
        el.id = dom.getCursorId(ctx)
        Object.assign(el.style, {
          width: "15px",
          height: "15px",
          position: "fixed",
          pointerEvents: "none",
          left: "0px",
          top: "0px",
          zIndex: 99999,
          transform: ctx.cursorPoint ? `translate3d(${ctx.cursorPoint.x}px, ${ctx.cursorPoint.y}px, 0px)` : undefined,
          willChange: "transform",
        })
        el.innerHTML = `
        <svg width="46" height="15" style="left: -15.5px; position: absolute; top: 0; filter: drop-shadow(rgba(0, 0, 0, 0.4) 0px 1px 1.1px);">
          <g transform="translate(2 3)">
            <path fill-rule="evenodd" d="M 15 4.5L 15 2L 11.5 5.5L 15 9L 15 6.5L 31 6.5L 31 9L 34.5 5.5L 31 2L 31 4.5Z" style="stroke-width: 2px; stroke: white;"></path>
            <path fill-rule="evenodd" d="M 15 4.5L 15 2L 11.5 5.5L 15 9L 15 6.5L 31 6.5L 31 9L 34.5 5.5L 31 2L 31 4.5Z"></path>
          </g>
        </svg>`
        doc.body.appendChild(el)
      },
      removeCustomCursor(ctx) {
        if (isSafari() || !supportsPointerEvent()) return
        const doc = dom.getDoc(ctx)
        const el = doc.getElementById(dom.getCursorId(ctx))
        if (!el) return
        el.remove()
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
  },
)
