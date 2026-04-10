import {
  ariaAttr,
  dataAttr,
  getEventPoint,
  getEventStep,
  getWindow,
  MAX_Z_INDEX,
  isComposingEvent,
  isLeftClick,
  isModifierKey,
  raf,
  setCaretToEnd,
} from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { roundToDpr, toPx } from "@zag-js/utils"
import { recordCursor } from "./cursor"
import { parts } from "./number-input.anatomy"
import * as dom from "./number-input.dom"
import type { NumberInputApi, NumberInputService } from "./number-input.types"

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

  const translations = prop("translations")

  return {
    focused: focused,
    scrubbing: scrubbing,
    invalid: invalid,
    empty: empty,
    value: computed("formattedValue"),
    valueAsNumber: computed("valueAsNumber"),
    setValue(value) {
      send({ type: "VALUE.SET", value })
    },
    clearValue() {
      send({ type: "VALUE.CLEAR" })
    },
    increment() {
      send({ type: "VALUE.INCREMENT" })
    },
    decrement() {
      send({ type: "VALUE.DECREMENT" })
    },
    setToMax() {
      send({ type: "VALUE.SET", value: prop("max") })
    },
    setToMin() {
      send({ type: "VALUE.SET", value: prop("min") })
    },
    focus() {
      dom.getInputEl(scope)?.focus()
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs(scope.id),
        dir: prop("dir"),
        "data-disabled": dataAttr(disabled),
        "data-focus": dataAttr(focused),
        "data-invalid": dataAttr(invalid),
        "data-scrubbing": dataAttr(scrubbing),
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

    getInputProps() {
      return normalize.input({
        ...parts.input.attrs(scope.id),
        dir: prop("dir"),
        name: prop("name"),
        form: prop("form"),
        id: dom.getInputId(scope),
        role: "spinbutton",
        defaultValue: computed("formattedValue"),
        pattern: prop("formatOptions") ? undefined : prop("pattern"),
        inputMode: prop("inputMode"),
        "aria-invalid": ariaAttr(invalid),
        "data-invalid": dataAttr(invalid),
        disabled,
        "data-disabled": dataAttr(disabled),
        readOnly,
        required: prop("required"),
        autoComplete: "off",
        autoCorrect: "off",
        spellCheck: "false",
        type: "text",
        "aria-roledescription": "numberfield",
        "aria-valuemin": prop("min"),
        "aria-valuemax": prop("max"),
        "aria-valuenow": Number.isNaN(computed("valueAsNumber")) ? undefined : computed("valueAsNumber"),
        "aria-valuetext": computed("valueText"),
        "data-scrubbing": dataAttr(scrubbing),
        onFocus() {
          send({ type: "INPUT.FOCUS" })
        },
        onBlur() {
          send({ type: "INPUT.BLUR" })
        },
        onInput(event) {
          const selection = recordCursor(event.currentTarget, scope)
          send({ type: "INPUT.CHANGE", target: event.currentTarget, hint: "set", selection })
        },
        onBeforeInput(event) {
          try {
            const { selectionStart, selectionEnd, value } = event.currentTarget

            const nextValue = value.slice(0, selectionStart!) + ((event as any).data ?? "") + value.slice(selectionEnd!)
            const isValid = computed("parser").isValidPartialNumber(nextValue)

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

          const step = getEventStep(event, {
            step: prop("step"),
            largeStep: prop("largeStep"),
            smallStep: prop("smallStep"),
          })

          const keyMap: EventKeyMap<HTMLInputElement> = {
            ArrowUp() {
              send({ type: "INPUT.ARROW_UP", step })
              event.preventDefault()
            },
            ArrowDown() {
              send({ type: "INPUT.ARROW_DOWN", step })
              event.preventDefault()
            },
            Home() {
              if (isModifierKey(event)) return
              send({ type: "INPUT.HOME" })
              event.preventDefault()
            },
            End() {
              if (isModifierKey(event)) return
              send({ type: "INPUT.END" })
              event.preventDefault()
            },
            Enter(event) {
              const selection = recordCursor(event.currentTarget, scope)
              send({ type: "INPUT.ENTER", selection })
            },
          }

          const exec = keyMap[event.key]
          exec?.(event)
        },
      })
    },

    getDecrementTriggerProps() {
      return normalize.button({
        ...parts.decrementTrigger.attrs(scope.id),
        dir: prop("dir"),
        disabled: isDecrementDisabled,
        "data-disabled": dataAttr(isDecrementDisabled),
        "aria-label": translations.decrementLabel,
        type: "button",
        tabIndex: -1,
        "aria-controls": dom.getInputId(scope),
        "data-scrubbing": dataAttr(scrubbing),
        onPointerDown(event) {
          if (isDecrementDisabled) return
          if (!isLeftClick(event)) return
          send({ type: "TRIGGER.PRESS_DOWN", hint: "decrement", pointerType: event.pointerType })
          if (event.pointerType === "mouse") {
            event.preventDefault()
          }
          if (event.pointerType === "touch") {
            event.currentTarget?.focus({ preventScroll: true })
          }
        },
        onPointerUp(event) {
          send({ type: "TRIGGER.PRESS_UP", hint: "decrement", pointerType: event.pointerType })
        },
        onPointerLeave() {
          if (isDecrementDisabled) return
          send({ type: "TRIGGER.PRESS_UP", hint: "decrement" })
        },
      })
    },

    getIncrementTriggerProps() {
      return normalize.button({
        ...parts.incrementTrigger.attrs(scope.id),
        dir: prop("dir"),
        disabled: isIncrementDisabled,
        "data-disabled": dataAttr(isIncrementDisabled),
        "aria-label": translations.incrementLabel,
        type: "button",
        tabIndex: -1,
        "aria-controls": dom.getInputId(scope),
        "data-scrubbing": dataAttr(scrubbing),
        onPointerDown(event) {
          if (isIncrementDisabled || !isLeftClick(event)) return
          send({ type: "TRIGGER.PRESS_DOWN", hint: "increment", pointerType: event.pointerType })
          if (event.pointerType === "mouse") {
            event.preventDefault()
          }
          if (event.pointerType === "touch") {
            event.currentTarget?.focus({ preventScroll: true })
          }
        },
        onPointerUp(event) {
          send({ type: "TRIGGER.PRESS_UP", hint: "increment", pointerType: event.pointerType })
        },
        onPointerLeave(event) {
          send({ type: "TRIGGER.PRESS_UP", hint: "increment", pointerType: event.pointerType })
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
          if (disabled) return
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
        hidden: !scrubbing || !context.get("isPointerLockSupported"),
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
