import { choose, createMachine, guards } from "@zag-js/core"
import { addDomEvent, requestPointerLock } from "@zag-js/dom-event"
import { isSafari, observeAttributes, raf } from "@zag-js/dom-query"
import { trackFormControl } from "@zag-js/form-utils"
import { clamp, decrement, increment, isAtMax, isAtMin, isWithinRange } from "@zag-js/number-utils"
import { callAll, compact, isEqual } from "@zag-js/utils"
import { recordCursor, restoreCursor } from "./cursor"
import { dom } from "./number-input.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./number-input.types"
import { createFormatter, createParser, formatValue, parseValue } from "./number-input.utils"

const { not, and } = guards

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "number-input",
      initial: "idle",
      context: {
        dir: "ltr",
        locale: "en-US",
        focusInputOnChange: true,
        clampValueOnBlur: true,
        allowOverflow: false,
        inputMode: "decimal",
        pattern: "[0-9]*(.[0-9]+)?",
        value: "",
        step: 1,
        min: Number.MIN_SAFE_INTEGER,
        max: Number.MAX_SAFE_INTEGER,
        invalid: false,
        spinOnPress: true,
        disabled: false,
        readOnly: false,
        ...ctx,
        hint: null,
        scrubberCursorPoint: null,
        fieldsetDisabled: false,
        formatter: createFormatter(ctx.locale || "en-US", ctx.formatOptions),
        parser: createParser(ctx.locale || "en-US", ctx.formatOptions),
        translations: {
          incrementLabel: "increment value",
          decrementLabel: "decrease value",
          ...ctx.translations,
        },
      },

      computed: {
        isRtl: (ctx) => ctx.dir === "rtl",
        valueAsNumber: (ctx) => parseValue(ctx, ctx.value),
        formattedValue: (ctx) => formatValue(ctx, ctx.valueAsNumber),
        isAtMin: (ctx) => isAtMin(ctx.valueAsNumber, ctx),
        isAtMax: (ctx) => isAtMax(ctx.valueAsNumber, ctx),
        isOutOfRange: (ctx) => !isWithinRange(ctx.valueAsNumber, ctx),
        isValueEmpty: (ctx) => ctx.value === "",
        isDisabled: (ctx) => !!ctx.disabled || ctx.fieldsetDisabled,
        canIncrement: (ctx) => ctx.allowOverflow || !ctx.isAtMax,
        canDecrement: (ctx) => ctx.allowOverflow || !ctx.isAtMin,
        valueText: (ctx) => ctx.translations.valueText?.(ctx.value),
      },

      watch: {
        formatOptions: ["setFormatterAndParser", "syncInputElement"],
        locale: ["setFormatterAndParser", "syncInputElement"],
        value: ["syncInputElement"],
        isOutOfRange: ["invokeOnInvalid"],
        scrubberCursorPoint: ["setVirtualCursorPosition"],
      },

      activities: ["trackFormControl"],

      on: {
        "VALUE.SET": {
          actions: ["setRawValue", "setHintToSet"],
        },
        "VALUE.CLEAR": {
          actions: ["clearValue"],
        },
        "VALUE.INCREMENT": {
          actions: ["increment"],
        },
        "VALUE.DECREMENT": {
          actions: ["decrement"],
        },
      },

      states: {
        idle: {
          on: {
            "TRIGGER.PRESS_DOWN": [
              { guard: "isTouchPointer", target: "before:spin", actions: ["setHint"] },
              {
                target: "before:spin",
                actions: ["focusInput", "invokeOnFocus", "setHint"],
              },
            ],
            "SCRUBBER.PRESS_DOWN": {
              target: "scrubbing",
              actions: ["focusInput", "invokeOnFocus", "setHint", "setCursorPoint"],
            },
            "INPUT.FOCUS": {
              target: "focused",
              actions: ["focusInput", "invokeOnFocus"],
            },
          },
        },

        focused: {
          tags: "focus",
          activities: "attachWheelListener",
          on: {
            "TRIGGER.PRESS_DOWN": [
              { guard: "isTouchPointer", target: "before:spin", actions: ["setHint"] },
              { target: "before:spin", actions: ["focusInput", "setHint"] },
            ],
            "SCRUBBER.PRESS_DOWN": {
              target: "scrubbing",
              actions: ["focusInput", "setHint", "setCursorPoint"],
            },
            "INPUT.ARROW_UP": {
              actions: "increment",
            },
            "INPUT.ARROW_DOWN": {
              actions: "decrement",
            },
            "INPUT.HOME": {
              actions: "decrementToMin",
            },
            "INPUT.END": {
              actions: "incrementToMax",
            },
            "INPUT.CHANGE": {
              actions: ["setValue", "setHint"],
            },
            "INPUT.COMMIT": [
              {
                guard: and("clampValueOnBlur", not("isInRange")),
                target: "idle",
                actions: ["setClampedValue", "clearHint", "invokeOnBlur"],
              },
              {
                target: "idle",
                actions: ["setFormattedValue", "clearHint", "invokeOnBlur"],
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
            "TRIGGER.PRESS_UP": [
              { guard: "isTouchPointer", target: "focused", actions: "clearHint" },
              { target: "focused", actions: ["focusInput", "clearHint"] },
            ],
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
            "TRIGGER.PRESS_UP": {
              target: "focused",
              actions: ["focusInput", "clearHint"],
            },
          },
        },

        scrubbing: {
          tags: "focus",
          activities: ["activatePointerLock", "trackMousemove", "setupVirtualCursor", "preventTextSelection"],
          on: {
            "SCRUBBER.POINTER_UP": {
              target: "focused",
              actions: ["focusInput", "clearCursorPoint"],
            },
            "SCRUBBER.POINTER_MOVE": [
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
        clampValueOnBlur: (ctx) => ctx.clampValueOnBlur,
        isAtMin: (ctx) => ctx.isAtMin,
        spinOnPress: (ctx) => !!ctx.spinOnPress,
        isAtMax: (ctx) => ctx.isAtMax,
        isInRange: (ctx) => !ctx.isOutOfRange,
        isDecrementHint: (ctx, evt) => (evt.hint ?? ctx.hint) === "decrement",
        isIncrementHint: (ctx, evt) => (evt.hint ?? ctx.hint) === "increment",
        isTouchPointer: (_ctx, evt) => evt.pointerType === "touch",
      },

      activities: {
        trackFormControl(ctx, _evt, { initialContext }) {
          const inputEl = dom.getInputEl(ctx)
          return trackFormControl(inputEl, {
            onFieldsetDisabledChange(disabled) {
              ctx.fieldsetDisabled = disabled
            },
            onFormReset() {
              set.value(ctx, initialContext.value)
            },
          })
        },
        setupVirtualCursor(ctx) {
          return dom.setupVirtualCursor(ctx)
        },
        preventTextSelection(ctx) {
          return dom.preventTextSelection(ctx)
        },
        trackButtonDisabled(ctx, _evt, { send }) {
          const btn = dom.getPressedTriggerEl(ctx, ctx.hint)
          return observeAttributes(btn, {
            attributes: ["disabled"],
            callback() {
              send({ type: "TRIGGER.PRESS_UP", src: "attr" })
            },
          })
        },
        attachWheelListener(ctx, _evt, { send }) {
          const inputEl = dom.getInputEl(ctx)
          if (!inputEl || !dom.isActiveElement(ctx, inputEl) || !ctx.allowMouseWheel) return

          function onWheel(event: WheelEvent) {
            event.preventDefault()
            const dir = Math.sign(event.deltaY) * -1
            if (dir === 1) {
              send("VALUE.INCREMENT")
            } else if (dir === -1) {
              send("VALUE.DECREMENT")
            }
          }

          return addDomEvent(inputEl, "wheel", onWheel, { passive: false })
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
              type: "SCRUBBER.POINTER_MOVE",
              hint: value.hint,
              point: value.point,
            })
          }

          function onMouseup() {
            send("SCRUBBER.POINTER_UP")
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
          if (dom.isActiveElement(ctx, inputEl)) return
          raf(() => inputEl?.focus({ preventScroll: true }))
        },
        increment(ctx, evt) {
          const nextValue = increment(ctx.valueAsNumber, evt.step ?? ctx.step)
          const value = formatValue(ctx, clamp(nextValue, ctx))
          set.value(ctx, value)
        },
        decrement(ctx, evt) {
          const nextValue = decrement(ctx.valueAsNumber, evt.step ?? ctx.step)
          const value = formatValue(ctx, clamp(nextValue, ctx))
          set.value(ctx, value)
        },
        setClampedValue(ctx) {
          const nextValue = clamp(ctx.valueAsNumber, ctx)
          set.value(ctx, formatValue(ctx, nextValue))
        },
        setRawValue(ctx, evt) {
          const parsedValue = parseValue(ctx, evt.value)
          const value = formatValue(ctx, clamp(parsedValue, ctx))
          set.value(ctx, value)
        },
        setValue(ctx, evt) {
          const value = evt.target?.value ?? evt.value
          set.value(ctx, value)
        },
        clearValue(ctx) {
          set.value(ctx, "")
        },
        incrementToMax(ctx) {
          const value = formatValue(ctx, ctx.max)
          set.value(ctx, value)
        },
        decrementToMin(ctx) {
          const value = formatValue(ctx, ctx.min)
          set.value(ctx, value)
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
        invokeOnFocus(ctx) {
          ctx.onFocusChange?.({
            focused: true,
            value: ctx.formattedValue,
            valueAsNumber: ctx.valueAsNumber,
          })
        },
        invokeOnBlur(ctx) {
          ctx.onFocusChange?.({
            focused: false,
            value: ctx.formattedValue,
            valueAsNumber: ctx.valueAsNumber,
          })
        },
        invokeOnInvalid(ctx) {
          if (!ctx.isOutOfRange) return
          const reason = ctx.valueAsNumber > ctx.max ? "rangeOverflow" : "rangeUnderflow"
          ctx.onValueInvalid?.({
            reason,
            value: ctx.formattedValue,
            valueAsNumber: ctx.valueAsNumber,
          })
        },
        syncInputElement(ctx, evt) {
          const value = evt.type.endsWith("CHANGE") ? ctx.value : ctx.formattedValue
          sync.input(ctx, value)
        },
        setFormattedValue(ctx) {
          set.value(ctx, ctx.formattedValue)
        },
        setCursorPoint(ctx, evt) {
          ctx.scrubberCursorPoint = evt.point
        },
        clearCursorPoint(ctx) {
          ctx.scrubberCursorPoint = null
        },
        setVirtualCursorPosition(ctx) {
          const cursorEl = dom.getCursorEl(ctx)
          if (!cursorEl || !ctx.scrubberCursorPoint) return
          const { x, y } = ctx.scrubberCursorPoint
          cursorEl.style.transform = `translate3d(${x}px, ${y}px, 0px)`
        },
        setFormatterAndParser(ctx) {
          if (!ctx.locale) return
          ctx.formatter = createFormatter(ctx.locale, ctx.formatOptions)
          ctx.parser = createParser(ctx.locale, ctx.formatOptions)
        },
      },
      compareFns: {
        formatOptions: (a, b) => isEqual(a, b),
        scrubberCursorPoint: (a, b) => isEqual(a, b),
      },
    },
  )
}

const sync = {
  input(ctx: MachineContext, value: string) {
    const inputEl = dom.getInputEl(ctx)
    if (!inputEl) return

    // record cursor position before updating input value
    const sel = recordCursor(inputEl)

    // restore cursor position after updating input value
    raf(() => {
      dom.setValue(inputEl, value)
      restoreCursor(inputEl, sel)
    })
  },
}

const invoke = {
  onChange: (ctx: MachineContext) => {
    ctx.onValueChange?.({
      value: ctx.value,
      valueAsNumber: ctx.valueAsNumber,
    })
  },
}

const set = {
  value: (ctx: MachineContext, value: string) => {
    if (isEqual(ctx.value, value)) return
    ctx.value = value
    invoke.onChange(ctx)
  },
}
