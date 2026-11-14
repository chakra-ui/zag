import { memo, setup, type Params } from "@zag-js/core"
import {
  addDomEvent,
  AnimationFrame,
  isFirefox,
  isIPhone,
  isIos,
  isSafari,
  observeAttributes,
  recordCursor,
  requestPointerLock,
  restoreCursor,
  setElementValue,
  trackFormControl,
} from "@zag-js/dom-query"
import type { Point } from "@zag-js/types"
import { callAll, clampValue, decrementValue, incrementValue, isValueWithinRange } from "@zag-js/utils"
import * as dom from "./number-input.dom"
import type { NumberInputSchema, Platform, StepDirection, ValueChangeReason } from "./number-input.types"
import {
  createFormatter,
  createParser,
  formatNumber,
  formatValue,
  getDefaultStep,
  parseValue,
  snapToStep,
} from "./number-input.utils"

const { choose, guards, createMachine } = setup<NumberInputSchema>()

const { not, and } = guards

export const machine = createMachine({
  props({ props }) {
    const step = getDefaultStep(props.step, props.formatOptions)
    return {
      dir: "ltr",
      locale: "en-US",
      focusInputOnChange: true,
      allowOutOfRange: false,
      pattern: "-?[0-9]*(.[0-9]+)?",
      defaultValue: null,
      step,
      spinOnPress: true,
      scrubberPixelSensitivity: 2,
      scrubberDirection: "horizontal",
      snapOnStep: false,
      ...props,
      largeStep: props.largeStep ?? 10 * step,
      smallStep: props.smallStep ?? step / 10,
    }
  },

  initialState() {
    return "idle"
  },

  refs({ prop }) {
    return {
      syncFrame: AnimationFrame.create(),
      pressDirection: 1,
      focusFrame: AnimationFrame.create(),
      committedValue: prop("value") ?? prop("defaultValue") ?? null,
    }
  },

  exit: ["cancelFrames"],

  context({ prop, bindable, getComputed, getEvent }) {
    return {
      value: bindable<number | null>(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        onChange(value) {
          const formattedValue = formatValue(value, { computed: getComputed(), prop })
          prop("onValueChange")?.({ value, formattedValue, reason: getEvent().src as ValueChangeReason })
        },
      })),
      inputValue: bindable<string>(() => ({
        defaultValue: formatNumber(
          prop("value") ?? prop("defaultValue"),
          createFormatter(prop("locale"), prop("formatOptions")),
          prop("formatOptions"),
        ),
      })),
      scrubberCursorPoint: bindable<Point | null>(() => ({
        defaultValue: null,
        hash(value) {
          return value ? `x:${value.x}, y:${value.y}` : ""
        },
      })),
      fieldsetDisabled: bindable<boolean>(() => ({ defaultValue: false })),
      cumulativeDelta: bindable<number>(() => ({ defaultValue: 0 })),
      platform: bindable<Platform>(() => ({
        defaultValue: { iPhone: false, ios: false, supportsPointerLock: false },
      })),
      visualScale: bindable<number>(() => ({ defaultValue: 1 })),
    }
  },

  computed: {
    isRtl: ({ prop }) => prop("dir") === "rtl",
    min: ({ prop }) => prop("min") ?? -Infinity,
    max: ({ prop }) => prop("max") ?? Infinity,
    formattedValue: ({ context, computed, prop }) => formatValue(context.get("value"), { computed, prop }),
    isAtMin: ({ context, computed }) => {
      const value = context.get("value")
      return value != null && value <= computed("min")
    },
    isAtMax: ({ context, computed }) => {
      const value = context.get("value")
      return value != null && value >= computed("max")
    },
    isOutOfRange: ({ context, prop }) => {
      const value = context.get("value")
      return value != null && !isValueWithinRange(value, prop("min"), prop("max"))
    },
    isValueEmpty: ({ context }) => context.get("value") == null,
    isDisabled: ({ prop, context }) => !!prop("disabled") || context.get("fieldsetDisabled"),
    canIncrement: ({ computed }) => !computed("isAtMax"),
    canDecrement: ({ computed }) => !computed("isAtMin"),
    formatter: memo(
      ({ prop }) => [prop("locale"), prop("formatOptions")],
      ([locale, formatOptions]) => createFormatter(locale, formatOptions),
    ),
    parser: memo(
      ({ prop }) => [prop("locale"), prop("formatOptions")],
      ([locale, formatOptions]) => createParser(locale, formatOptions),
    ),
  },

  watch({ track, action, context, computed, prop }) {
    track([() => context.get("value"), () => prop("locale"), () => JSON.stringify(prop("formatOptions"))], () => {
      action(["syncInputValue", "syncHiddenInput"])
    })

    track([() => context.get("inputValue")], () => {
      action(["syncInputValue", "syncInputElement"])
    })

    track([() => computed("isOutOfRange")], () => {
      if (!computed("isOutOfRange")) return
      action(["invokeOnInvalid"])
    })

    track([() => context.hash("scrubberCursorPoint")], () => {
      action(["setVirtualCursorPosition"])
    })
  },

  effects: ["trackFormControl", "detectPlatform"],

  on: {
    "INPUT.FOCUS": {
      actions: ["invokeOnFocus"],
    },
    "VALUE.SET": {
      actions: ["setRawValue", "invokeOnValueCommit"],
    },
    "VALUE.CLEAR": {
      actions: ["clearValue", "invokeOnValueCommit"],
    },
    "VALUE.INCREMENT": {
      actions: ["increment", "invokeOnValueCommit"],
    },
    "VALUE.DECREMENT": {
      actions: ["decrement", "invokeOnValueCommit"],
    },
  },

  states: {
    idle: {
      on: {
        "TRIGGER.PRESS_DOWN": [
          { guard: "isTouchPointer", target: "pressed", actions: ["setPressDirection"] },
          { target: "pressed", actions: ["focusInput", "setPressDirection"] },
        ],
        "SCRUBBER.PRESS_DOWN": {
          target: "scrubbing",
          actions: ["focusInput", "setCursorPoint"],
        },
        "INPUT.FOCUS": {
          target: "focused",
          actions: ["focusInput", "invokeOnFocus"],
        },
      },
    },

    focused: {
      tags: ["focus"],
      effects: ["attachWheelListener"],
      on: {
        "TRIGGER.PRESS_DOWN": [
          { guard: "isTouchPointer", target: "pressed", actions: ["setPressDirection"] },
          { target: "pressed", actions: ["focusInput", "setPressDirection"] },
        ],
        "SCRUBBER.PRESS_DOWN": {
          target: "scrubbing",
          actions: ["focusInput", "setCursorPoint"],
        },
        "INPUT.ARROW_UP": {
          actions: ["increment", "invokeOnValueCommit"],
        },
        "INPUT.ARROW_DOWN": {
          actions: ["decrement", "invokeOnValueCommit"],
        },
        "INPUT.HOME": {
          actions: ["decrementToMin", "invokeOnValueCommit"],
        },
        "INPUT.END": {
          actions: ["incrementToMax", "invokeOnValueCommit"],
        },
        "INPUT.CHANGE": {
          actions: ["setInputValue"],
        },
        "INPUT.BLUR": [
          {
            guard: and(not("allowOutOfRange"), not("isInRange")),
            target: "idle",
            actions: ["setClampedValue", "invokeOnBlur", "invokeOnValueCommit"],
          },
          {
            target: "idle",
            actions: ["setFormattedValue", "invokeOnBlur", "invokeOnValueCommit"],
          },
        ],
        // No target, so the input stays focused. It must not report a blur.
        "INPUT.ENTER": [
          {
            guard: and(not("allowOutOfRange"), not("isInRange")),
            actions: ["setClampedValue", "invokeOnValueCommit"],
          },
          {
            actions: ["setFormattedValue", "invokeOnValueCommit"],
          },
        ],
      },
    },

    pressed: {
      tags: ["focus"],
      initial: "waiting",
      effects: ["trackButtonDisabled", "preventContextMenu"],
      on: {
        "TRIGGER.PRESS_UP": [
          { guard: "isTouchPointer", target: "focused", actions: ["invokeOnValueCommit"] },
          { target: "focused", actions: ["focusInput", "invokeOnValueCommit"] },
        ],
      },
      states: {
        waiting: {
          effects: ["waitForChangeDelay"],
          entry: choose([{ guard: not("isTouchPointer"), actions: ["step"] }]),
          on: {
            "TRIGGER.PRESS_UP": [
              {
                guard: and("isTouchPointer", "isTouchTap"),
                target: "focused",
                actions: ["step", "invokeOnValueCommit"],
              },
              { guard: "isTouchPointer", target: "focused" },
              { target: "focused", actions: ["focusInput", "invokeOnValueCommit"] },
            ],
            CHANGE_DELAY: {
              target: "repeating",
              guard: and("isInRange", "spinOnPress"),
            },
          },
        },

        repeating: {
          effects: ["spinValue"],
          on: {
            SPIN: {
              actions: ["step"],
            },
          },
        },
      },
    },

    scrubbing: {
      tags: ["focus"],
      effects: ["activatePointerLock", "trackMousemove", "preventTextSelection", "trackVisualViewport"],
      entry: ["clearCumulativeDelta"],
      on: {
        "SCRUBBER.STEP": {
          actions: ["step"],
        },
        "SCRUBBER.POINTER_UP": {
          target: "focused",
          actions: ["focusInput", "clearCursorPoint", "clearCumulativeDelta", "invokeOnValueCommit"],
        },
        "SCRUBBER.POINTER_MOVE": {
          // accumulateDelta sends a step, which some frameworks run before the next action reads this event
          actions: ["setCursorPoint", "accumulateDelta"],
        },
      },
    },
  },

  implementations: {
    guards: {
      allowOutOfRange: ({ prop }) => !!prop("allowOutOfRange"),
      spinOnPress: ({ prop }) => !!prop("spinOnPress"),
      isInRange: ({ computed }) => !computed("isOutOfRange"),
      isTouchPointer: ({ event }) => event.pointerType === "touch",
      isTouchTap: ({ event }) => !event.cancelled,
    },

    effects: {
      waitForChangeDelay({ send }) {
        const id = setTimeout(() => {
          send({ type: "CHANGE_DELAY" })
        }, 400)
        return () => clearTimeout(id)
      },

      preventContextMenu({ scope }) {
        // A touch can drift outside the button mid-hold and raise the context menu.
        return addDomEvent(scope.getWin(), "contextmenu", (event) => event.preventDefault())
      },

      spinValue({ send, refs }) {
        const id = setInterval(() => {
          send({ type: "SPIN", src: getPressSource(refs.get("pressDirection")) })
        }, 60)
        return () => clearInterval(id)
      },

      detectPlatform({ context }) {
        context.set("platform", { iPhone: isIPhone(), ios: isIos(), supportsPointerLock: !isSafari() })
      },
      trackFormControl({ context, scope }) {
        const inputEl = dom.getHiddenInputEl(scope) ?? dom.getInputEl(scope)
        return trackFormControl(inputEl, {
          onFieldsetDisabledChange(disabled) {
            context.set("fieldsetDisabled", disabled)
          },
          onFormReset() {
            context.set("value", context.initial("value") ?? null)
          },
        })
      },
      preventTextSelection({ scope, prop }) {
        return dom.preventTextSelection(scope, prop("scrubberDirection"))
      },
      trackButtonDisabled({ refs, scope, send }) {
        const direction = refs.get("pressDirection")
        const btn = dom.getTriggerEl(scope, direction)
        return observeAttributes(btn, {
          attributes: ["disabled"],
          callback() {
            send({ type: "TRIGGER.PRESS_UP", src: getPressSource(direction) })
          },
        })
      },
      attachWheelListener({ scope, send, prop }) {
        const inputEl = dom.getInputEl(scope)
        if (!inputEl || !scope.isActiveElement(inputEl) || !prop("allowMouseWheel")) return

        function onWheel(event: WheelEvent) {
          if (prop("readOnly")) return
          if (event.ctrlKey) return
          // Some browsers turn shift + wheel into a horizontal scroll
          const isHorizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY)
          const delta = event.shiftKey && isHorizontal ? event.deltaX : event.deltaY
          // Leave horizontal gestures to the page
          if (delta === 0 || (isHorizontal && !event.shiftKey)) return
          event.preventDefault()
          const step = event.altKey ? prop("smallStep") : event.shiftKey ? prop("largeStep") : prop("step")
          send({ type: delta < 0 ? "VALUE.INCREMENT" : "VALUE.DECREMENT", step, src: "wheel" })
        }

        return addDomEvent(inputEl, "wheel", onWheel, { passive: false })
      },
      trackVisualViewport({ scope, context }) {
        const vV = scope.getWin().visualViewport
        if (!vV) return
        function onResize() {
          context.set("visualScale", vV!.scale)
        }
        onResize()
        return addDomEvent(vV, "resize", onResize)
      },
      activatePointerLock({ scope }) {
        if (isSafari()) return
        const cleanup = requestPointerLock(scope.getDoc())
        return () => {
          // Firefox needs a small delay before releasing pointer lock on soft-clicks,
          // otherwise the lock won't release properly.
          if (isFirefox()) {
            setTimeout(() => cleanup?.(), 20)
          } else {
            cleanup?.()
          }
        }
      },
      trackMousemove({ scope, send, context, computed, prop }) {
        const doc = scope.getDoc()

        function onMousemove(event: MouseEvent) {
          const point = context.get("scrubberCursorPoint")
          const isRtl = computed("isRtl")
          const axis = prop("scrubberDirection")
          const teleportDistance = prop("scrubberTeleportDistance")
          const value = dom.getMousemoveValue(scope, { point, isRtl, event, axis, teleportDistance })
          send({
            type: "SCRUBBER.POINTER_MOVE",
            direction: value.direction,
            point: value.point,
            delta: value.delta,
          })
        }

        function onMouseup() {
          send({ type: "SCRUBBER.POINTER_UP", src: "scrub" })
        }

        return callAll(addDomEvent(doc, "mousemove", onMousemove, false), addDomEvent(doc, "mouseup", onMouseup, false))
      },
    },

    actions: {
      focusInput({ scope, prop, refs }) {
        if (!prop("focusInputOnChange")) return
        const inputEl = dom.getInputEl(scope)
        if (scope.isActiveElement(inputEl)) return
        refs.get("focusFrame").request(() => inputEl?.focus({ preventScroll: true }))
      },
      cancelFrames({ refs }) {
        refs.get("syncFrame").cancel()
        refs.get("focusFrame").cancel()
      },
      increment({ event, prop, computed, context }) {
        const value = context.get("value")
        const step = event.step ?? prop("step")
        const next = value == null ? 0 : incrementValue(value, step)
        setNumber({ context, prop, computed }, getStepValue(next, step, 1, { prop, computed }))
      },
      decrement({ event, prop, computed, context }) {
        const value = context.get("value")
        const step = event.step ?? prop("step")
        const next = value == null ? 0 : decrementValue(value, step)
        setNumber({ context, prop, computed }, getStepValue(next, step, -1, { prop, computed }))
      },
      setClampedValue({ context, prop, computed }) {
        const value = context.get("value")
        setNumber(
          { context, prop, computed },
          value == null ? null : clampValue(value, computed("min"), computed("max")),
        )
      },
      setRawValue({ context, event, prop, computed }) {
        let value: number = event.value
        if (!prop("allowOutOfRange")) value = clampValue(value, computed("min"), computed("max"))
        setNumber({ context, prop, computed }, value)
      },
      setInputValue({ context, event, computed, prop }) {
        const text: string = event.value
        context.set("inputValue", text)
        if (text.trim() === "") {
          context.set("value", null)
          return
        }
        const value = parseValue(text, { computed, prop })
        // A partial number like "-" or "1." keeps the last value
        if (!Number.isNaN(value)) context.set("value", normalizeZero(value))
      },
      clearValue({ context }) {
        context.set("value", null)
        context.set("inputValue", "")
      },
      incrementToMax({ context, prop, computed }) {
        setNumber({ context, prop, computed }, computed("max"))
      },
      decrementToMin({ context, prop, computed }) {
        setNumber({ context, prop, computed }, computed("min"))
      },
      setPressDirection({ refs, event }) {
        refs.set("pressDirection", event.direction)
      },
      step({ event, refs, action }) {
        const direction = event.direction ?? refs.get("pressDirection")
        action([direction > 0 ? "increment" : "decrement"])
      },
      invokeOnFocus({ context, computed, prop }) {
        prop("onFocusChange")?.({
          focused: true,
          value: context.get("value"),
          formattedValue: computed("formattedValue"),
        })
      },
      invokeOnBlur({ context, computed, prop }) {
        prop("onFocusChange")?.({
          focused: false,
          value: context.get("value"),
          formattedValue: computed("formattedValue"),
        })
      },
      invokeOnInvalid({ context, computed, prop }) {
        const value = context.get("value")
        if (value == null) return
        prop("onValueInvalid")?.({
          reason: value > computed("max") ? "rangeOverflow" : "rangeUnderflow",
          value,
          formattedValue: computed("formattedValue"),
        })
      },
      invokeOnValueCommit({ context, computed, prop, event, refs }) {
        const reason = event.src as ValueChangeReason
        // Wait for a controlled parent to apply (or refuse) the change
        queueMicrotask(() => {
          const value = context.get("value")
          // A blur or step that changes nothing has nothing to commit
          if (value === refs.get("committedValue")) return
          refs.set("committedValue", value)
          prop("onValueCommit")?.({ value, formattedValue: computed("formattedValue"), reason })
        })
      },
      syncInputValue({ context, computed, prop, state }) {
        const text = context.get("inputValue")
        const formatted = computed("formattedValue")
        if (text === formatted) return
        // While typing, keep the text as long as it still reads as the value
        if (state.hasTag("focus") && representsValue(text, context.get("value"), { computed, prop })) return
        context.set("inputValue", formatted)
      },
      syncInputElement({ context, event, scope, refs }) {
        const value = context.get("inputValue")
        const inputEl = dom.getInputEl(scope)
        // Record cursor position before sync if not provided in event
        // This handles external value changes while user is typing
        const sel = event.selection ?? recordCursor(inputEl)
        // a newer sync replaces a pending one
        refs.get("syncFrame").request(() => {
          const unchanged = inputEl?.value === value
          setElementValue(inputEl, value)
          // the caret may have moved since it was recorded; only restore it if the value was rewritten
          if (!unchanged) restoreCursor(inputEl, sel)
        })
      },
      syncHiddenInput({ scope, context }) {
        const value = context.get("value")
        dom.dispatchHiddenInputValue(scope, value == null ? "" : String(value))
      },
      setFormattedValue({ context, computed }) {
        context.set("inputValue", computed("formattedValue"))
      },
      setCursorPoint({ context, event }) {
        context.set("scrubberCursorPoint", event.point)
      },
      clearCursorPoint({ context }) {
        context.set("scrubberCursorPoint", null)
      },
      setVirtualCursorPosition({ context, scope }) {
        const scrubberEl = dom.getScrubberEl(scope)
        const point = context.get("scrubberCursorPoint")
        if (!scrubberEl || !point) return
        scrubberEl.style.setProperty("--scrubber-x", `${point.x}px`)
        scrubberEl.style.setProperty("--scrubber-y", `${point.y}px`)
      },
      accumulateDelta({ context, event, prop, send }) {
        const delta = event.delta ?? 0
        const newDelta = context.get("cumulativeDelta") + delta
        const pixels = prop("scrubberPixelSensitivity")
        // 0 or less would divide by zero, so step on every pixel instead
        const sensitivity = pixels > 0 ? pixels : 1

        if (Math.abs(newDelta) >= sensitivity) {
          // Determine step based on modifier keys
          const step = prop("step")
          if (event.direction) {
            send({ type: "SCRUBBER.STEP", step, direction: event.direction, src: "scrub" })
          }
          // Reset the accumulator (keep remainder for sub-pixel accuracy)
          context.set("cumulativeDelta", newDelta % sensitivity)
        } else {
          context.set("cumulativeDelta", newDelta)
        }
      },
      clearCumulativeDelta({ context }) {
        context.set("cumulativeDelta", 0)
      },
    },
  },
})

const getPressSource = (direction: StepDirection): ValueChangeReason =>
  direction > 0 ? "increment-trigger" : "decrement-trigger"

type NumberParams = Pick<Params<NumberInputSchema>, "context" | "prop" | "computed">

/** Sets the number and shows it formatted */
function setNumber({ context, prop, computed }: NumberParams, value: number | null) {
  value = value == null ? null : normalizeZero(value)
  context.set("value", value)
  context.set("inputValue", formatValue(value, { computed, prop }))
}

function getStepValue(
  value: number,
  step: number,
  direction: number,
  { prop, computed }: Omit<NumberParams, "context">,
) {
  // Snap before clamping, so a min or max off the step grid stays reachable
  if (prop("snapOnStep")) value = snapToStep(value, prop("min") ?? 0, step, direction)
  return clampValue(value, computed("min"), computed("max"))
}

function representsValue(text: string, value: number | null, params: Omit<NumberParams, "context">) {
  if (text.trim() === "") return value == null
  const parsed = parseValue(text, params)
  // A partial number like "-" can't be compared yet
  return Number.isNaN(parsed) || parsed === value
}

// -0 is the same number to a person, and some frameworks don't see 0 and -0 as different
const normalizeZero = (value: number) => (value === 0 ? 0 : value)
