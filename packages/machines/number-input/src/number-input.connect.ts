import {
  ariaAttr,
  dataAttr,
  getEventPoint,
  getEventStepValue,
  getNativeEvent,
  getWindow,
  isComposingEvent,
  isInternalChangeEvent,
  isLeftClick,
  isModifierKey,
  MAX_Z_INDEX,
  raf,
  recordCursor,
  setCaretToEnd,
  visuallyHiddenStyle,
} from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { mergeWithDefault, roundToDpr, toPx } from "@zag-js/utils"
import { parts } from "./number-input.anatomy"
import * as dom from "./number-input.dom"
import { defaultTranslations } from "./number-input.translations"
import { normalizeNumberText } from "./number-input.utils"
import type {
  DecrementTriggerState,
  IncrementTriggerState,
  InputState,
  NumberInputApi,
  NumberInputService,
  RootState,
} from "./number-input.types"

export function connect<T extends PropTypes>(
  service: NumberInputService,
  normalize: NormalizeProps<T>,
): NumberInputApi<T> {
  const { state, send, prop, scope, computed, context } = service

  const focused = state.hasTag("focus")
  const disabled = computed("isDisabled")
  const readOnly = !!prop("readOnly")
  const required = !!prop("required")
  const scrubbing = state.matches("scrubbing")

  const empty = computed("isValueEmpty")
  const invalid = prop("invalid") !== undefined ? !!prop("invalid") : computed("isOutOfRange")

  const isIncrementDisabled = disabled || !computed("canIncrement") || readOnly
  const isDecrementDisabled = disabled || !computed("canDecrement") || readOnly

  const translations = mergeWithDefault(defaultTranslations, prop("translations"))

  const min = prop("min")
  const max = prop("max")
  const allowsNegative = min == null || min < 0
  const inputMode = prop("inputMode") ?? (context.get("platform").iPhone && allowsNegative ? "text" : "decimal")

  // -----------------------------------------------------------------------------
  // State getters: pure, serializable per-part state, independent of `normalize`
  // -----------------------------------------------------------------------------

  function getRootState(): RootState {
    return { disabled, focused, invalid, scrubbing }
  }

  function getInputState(): InputState {
    return { disabled, invalid, readOnly, scrubbing }
  }

  function getIncrementTriggerState(): IncrementTriggerState {
    return { disabled: isIncrementDisabled }
  }

  function getDecrementTriggerState(): DecrementTriggerState {
    return { disabled: isDecrementDisabled }
  }

  // -----------------------------------------------------------------------------
  // Prop getters
  // -----------------------------------------------------------------------------

  return {
    focused: focused,
    scrubbing: scrubbing,
    invalid: invalid,
    empty: empty,
    value: context.get("value"),
    formattedValue: computed("formattedValue"),
    setValue(value) {
      send({ type: "VALUE.SET", value, src: "script" })
    },
    clearValue() {
      send({ type: "VALUE.CLEAR", src: "script" })
    },
    increment() {
      send({ type: "VALUE.INCREMENT", src: "script" })
    },
    decrement() {
      send({ type: "VALUE.DECREMENT", src: "script" })
    },
    setToMax() {
      if (max == null) return
      send({ type: "VALUE.SET", value: max, src: "script" })
    },
    setToMin() {
      if (min == null) return
      send({ type: "VALUE.SET", value: min, src: "script" })
    },
    focus() {
      dom.getInputEl(scope)?.focus()
    },

    getRootState,
    getRootProps() {
      const rootState = getRootState()
      return normalize.element({
        ...parts.root.attrs(scope.id),
        dir: prop("dir"),
        "data-disabled": dataAttr(rootState.disabled),
        "data-focus": dataAttr(rootState.focused),
        "data-invalid": dataAttr(rootState.invalid),
        "data-scrubbing": dataAttr(rootState.scrubbing),
      })
    },

    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs(scope.id),
        dir: prop("dir"),
        "data-disabled": dataAttr(disabled),
        "data-focus": dataAttr(focused),
        "data-invalid": dataAttr(invalid),
        "data-required": dataAttr(required),
        "data-scrubbing": dataAttr(scrubbing),
        id: dom.getLabelId(scope),
        htmlFor: dom.getInputId(scope),
        onClick() {
          raf(() => {
            setCaretToEnd(dom.getInputEl(scope))
          })
        },
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs(scope.id),
        dir: prop("dir"),
        role: "group",
        "aria-disabled": disabled,
        "data-focus": dataAttr(focused),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-scrubbing": dataAttr(scrubbing),
        "aria-invalid": ariaAttr(invalid),
      })
    },

    getValueTextProps() {
      return normalize.element({
        ...parts.valueText.attrs(scope.id),
        dir: prop("dir"),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-focus": dataAttr(focused),
        "data-scrubbing": dataAttr(scrubbing),
      })
    },

    getInputState,
    getInputProps() {
      const inputState = getInputState()
      return normalize.input({
        ...parts.input.attrs(scope.id),
        dir: prop("dir"),
        id: dom.getInputId(scope),
        defaultValue: context.get("inputValue"),
        pattern: prop("formatOptions") ? undefined : prop("pattern"),
        inputMode,
        "aria-invalid": ariaAttr(inputState.invalid),
        "data-invalid": dataAttr(inputState.invalid),
        disabled: inputState.disabled,
        "data-disabled": dataAttr(inputState.disabled),
        readOnly: inputState.readOnly,
        required: prop("required"),
        autoComplete: "off",
        autoCorrect: "off",
        spellCheck: "false",
        type: "text",
        "aria-roledescription": context.get("platform").ios ? undefined : translations.roleDescription,
        "data-scrubbing": dataAttr(inputState.scrubbing),
        onFocus() {
          send({ type: "INPUT.FOCUS" })
        },
        onBlur() {
          send({ type: "INPUT.BLUR", src: "input-blur" })
        },
        onInput(event) {
          const selection = recordCursor(event.currentTarget)
          send({ type: "INPUT.CHANGE", value: event.currentTarget.value, selection, src: "input-change" })
        },
        onBeforeInput(event) {
          try {
            const { selectionStart, selectionEnd, value } = event.currentTarget

            const nextValue = value.slice(0, selectionStart!) + ((event as any).data ?? "") + value.slice(selectionEnd!)
            const allowOutOfRange = prop("allowOutOfRange")
            const isValid = computed("parser").isValidPartialNumber(
              normalizeNumberText(nextValue),
              allowOutOfRange ? undefined : min,
              allowOutOfRange ? undefined : max,
            )

            if (!isValid) {
              event.preventDefault()
            }
          } catch {
            // noop
          }
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (readOnly) return
          if (isComposingEvent(event)) return

          const step = getEventStepValue(event, {
            step: prop("step"),
            largeStep: prop("largeStep"),
            smallStep: prop("smallStep"),
          })

          const keyMap: EventKeyMap<HTMLInputElement> = {
            ArrowUp() {
              send({ type: "INPUT.ARROW_UP", step, src: "keyboard" })
              event.preventDefault()
              event.stopPropagation()
            },
            ArrowDown() {
              send({ type: "INPUT.ARROW_DOWN", step, src: "keyboard" })
              event.preventDefault()
              event.stopPropagation()
            },
            PageUp() {
              send({ type: "INPUT.ARROW_UP", step, src: "keyboard" })
              event.preventDefault()
              event.stopPropagation()
            },
            PageDown() {
              send({ type: "INPUT.ARROW_DOWN", step, src: "keyboard" })
              event.preventDefault()
              event.stopPropagation()
            },
            Home() {
              if (isModifierKey(event) || min == null) return
              send({ type: "INPUT.HOME", src: "keyboard" })
              event.preventDefault()
              event.stopPropagation()
            },
            End() {
              if (isModifierKey(event) || max == null) return
              send({ type: "INPUT.END", src: "keyboard" })
              event.preventDefault()
              event.stopPropagation()
            },
            Enter(event) {
              const selection = recordCursor(event.currentTarget)
              send({ type: "INPUT.ENTER", selection, src: "keyboard" })
            },
          }

          const exec = keyMap[event.key]
          exec?.(event)
        },
      })
    },

    getHiddenInputProps() {
      const value = context.get("value")

      const handleChange = (e: { currentTarget: HTMLInputElement; nativeEvent?: Event }) => {
        if (isInternalChangeEvent(getNativeEvent(e)) || disabled || readOnly) return
        const next = e.currentTarget.valueAsNumber
        if (Number.isNaN(next)) send({ type: "VALUE.CLEAR", src: "autofill" })
        else send({ type: "VALUE.SET", value: next, src: "autofill" })
      }

      return normalize.input({
        type: "number",
        id: dom.getHiddenInputId(scope),
        name: prop("name"),
        form: prop("form"),
        min,
        max,
        step: "any",
        disabled,
        readOnly,
        required,
        defaultValue: value == null ? "" : String(value),
        "aria-hidden": true,
        tabIndex: -1,
        style: visuallyHiddenStyle,
        onChange: handleChange,
        onInput: handleChange,
        onFocus() {
          dom.getInputEl(scope)?.focus({ preventScroll: true })
        },
      })
    },

    getDecrementTriggerState,
    getDecrementTriggerProps() {
      const decrementTriggerState = getDecrementTriggerState()
      return normalize.button({
        ...parts.decrementTrigger.attrs(scope.id),
        dir: prop("dir"),
        disabled: decrementTriggerState.disabled,
        "data-disabled": dataAttr(decrementTriggerState.disabled),
        "aria-label": translations.decrementLabel,
        type: "button",
        tabIndex: -1,
        "aria-controls": dom.getInputId(scope),
        "data-scrubbing": dataAttr(scrubbing),
        onClick(event) {
          // Pointer presses step on their own. This handles screen readers and `click()`.
          if (decrementTriggerState.disabled || event.detail !== 0) return
          send({ type: "VALUE.DECREMENT", src: "decrement-press" })
        },
        onPointerDown(event) {
          if (decrementTriggerState.disabled) return
          if (!isLeftClick(event)) return
          send({
            type: "TRIGGER.PRESS_DOWN",
            direction: -1,
            pointerType: event.pointerType,
            src: "decrement-press",
          })
          if (event.pointerType === "mouse") {
            event.preventDefault()
          }
          if (event.pointerType === "touch") {
            event.currentTarget?.focus({ preventScroll: true })
          }
        },
        onPointerUp(event) {
          send({ type: "TRIGGER.PRESS_UP", direction: -1, pointerType: event.pointerType, src: "decrement-press" })
        },
        onPointerLeave(event) {
          if (decrementTriggerState.disabled) return
          send({
            type: "TRIGGER.PRESS_UP",
            direction: -1,
            pointerType: event.pointerType,
            cancelled: true,
            src: "decrement-press",
          })
        },
        onPointerCancel(event) {
          send({
            type: "TRIGGER.PRESS_UP",
            direction: -1,
            pointerType: event.pointerType,
            cancelled: true,
            src: "decrement-press",
          })
        },
      })
    },

    getIncrementTriggerState,
    getIncrementTriggerProps() {
      const incrementTriggerState = getIncrementTriggerState()
      return normalize.button({
        ...parts.incrementTrigger.attrs(scope.id),
        dir: prop("dir"),
        disabled: incrementTriggerState.disabled,
        "data-disabled": dataAttr(incrementTriggerState.disabled),
        "aria-label": translations.incrementLabel,
        type: "button",
        tabIndex: -1,
        "aria-controls": dom.getInputId(scope),
        "data-scrubbing": dataAttr(scrubbing),
        onClick(event) {
          // Pointer presses step on their own. This handles screen readers and `click()`.
          if (incrementTriggerState.disabled || event.detail !== 0) return
          send({ type: "VALUE.INCREMENT", src: "increment-press" })
        },
        onPointerDown(event) {
          if (incrementTriggerState.disabled || !isLeftClick(event)) return
          send({
            type: "TRIGGER.PRESS_DOWN",
            direction: 1,
            pointerType: event.pointerType,
            src: "increment-press",
          })
          if (event.pointerType === "mouse") {
            event.preventDefault()
          }
          if (event.pointerType === "touch") {
            event.currentTarget?.focus({ preventScroll: true })
          }
        },
        onPointerUp(event) {
          send({ type: "TRIGGER.PRESS_UP", direction: 1, pointerType: event.pointerType, src: "increment-press" })
        },
        onPointerLeave(event) {
          send({
            type: "TRIGGER.PRESS_UP",
            direction: 1,
            pointerType: event.pointerType,
            cancelled: true,
            src: "increment-press",
          })
        },
        onPointerCancel(event) {
          send({
            type: "TRIGGER.PRESS_UP",
            direction: 1,
            pointerType: event.pointerType,
            cancelled: true,
            src: "increment-press",
          })
        },
      })
    },

    getScrubberProps() {
      const direction = prop("scrubberDirection")
      const point = context.get("scrubberCursorPoint")
      return normalize.element({
        ...parts.scrubber.attrs(scope.id),
        dir: prop("dir"),
        "data-disabled": dataAttr(disabled),
        role: "presentation",
        "data-scrubbing": dataAttr(scrubbing),
        onMouseDown(event) {
          if (disabled || readOnly) return
          if (!isLeftClick(event)) return

          const pt = getEventPoint(event)
          const win = getWindow(event.currentTarget)

          const dpr = win.devicePixelRatio
          pt.x = pt.x - roundToDpr(7.5, dpr)
          pt.y = pt.y - roundToDpr(7.5, dpr)

          send({ type: "SCRUBBER.PRESS_DOWN", point: pt })
          event.preventDefault()
          raf(() => {
            setCaretToEnd(dom.getInputEl(scope))
          })
        },
        style: {
          cursor: disabled ? undefined : direction === "vertical" ? "ns-resize" : "ew-resize",
          "--scrubber-x": point ? toPx(point.x) : undefined,
          "--scrubber-y": point ? toPx(point.y) : undefined,
          "--scrubber-scale": `${1 / context.get("visualScale")}`,
        },
      })
    },

    getScrubberCursorProps() {
      return normalize.element({
        ...parts.scrubberCursor.attrs(scope.id),
        hidden: !scrubbing || !context.get("platform").supportsPointerLock,
        style: {
          position: "fixed",
          pointerEvents: "none",
          left: "0px",
          top: "0px",
          zIndex: MAX_Z_INDEX,
          transform: "translate3d(var(--scrubber-x, 0px), var(--scrubber-y, 0px), 0px) scale(var(--scrubber-scale, 1))",
          willChange: "transform",
        },
      })
    },
  }
}
