import { getEventPoint, getEventStep, isLeftClick, type EventKeyMap } from "@zag-js/dom-event"
import { ariaAttr, dataAttr, isComposingEvent } from "@zag-js/dom-query"
import { roundToDevicePixel } from "@zag-js/number-utils"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./number-input.anatomy"
import { dom } from "./number-input.dom"
import type { MachineApi, Send, State } from "./number-input.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const focused = state.hasTag("focus")
  const disabled = state.context.isDisabled
  const readOnly = state.context.readOnly

  const empty = state.context.isValueEmpty
  const invalid = state.context.isOutOfRange || !!state.context.invalid

  const isIncrementDisabled = disabled || !state.context.canIncrement || readOnly
  const isDecrementDisabled = disabled || !state.context.canDecrement || readOnly

  const translations = state.context.translations

  return {
    focused: focused,
    invalid: invalid,
    empty: empty,
    value: state.context.formattedValue,
    valueAsNumber: state.context.valueAsNumber,
    setValue(value) {
      send({ type: "VALUE.SET", value })
    },
    clearValue() {
      send("VALUE.CLEAR")
    },
    increment() {
      send("VALUE.INCREMENT")
    },
    decrement() {
      send("VALUE.DECREMENT")
    },
    setToMax() {
      send({ type: "VALUE.SET", value: state.context.max })
    },
    setToMin() {
      send({ type: "VALUE.SET", value: state.context.min })
    },
    focus() {
      dom.getInputEl(state.context)?.focus()
    },

    getRootProps() {
      return normalize.element({
        id: dom.getRootId(state.context),
        ...parts.root.attrs,
        dir: state.context.dir,
        "data-disabled": dataAttr(disabled),
        "data-focus": dataAttr(focused),
        "data-invalid": dataAttr(invalid),
      })
    },

    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs,
        dir: state.context.dir,
        "data-disabled": dataAttr(disabled),
        "data-focus": dataAttr(focused),
        "data-invalid": dataAttr(invalid),
        id: dom.getLabelId(state.context),
        htmlFor: dom.getInputId(state.context),
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs,
        dir: state.context.dir,
        role: "group",
        "aria-disabled": disabled,
        "data-focus": dataAttr(focused),
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "aria-invalid": ariaAttr(state.context.invalid),
      })
    },

    getValueTextProps() {
      return normalize.element({
        ...parts.valueText.attrs,
        dir: state.context.dir,
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(invalid),
        "data-focus": dataAttr(focused),
      })
    },

    getInputProps() {
      return normalize.input({
        ...parts.input.attrs,
        dir: state.context.dir,
        name: state.context.name,
        form: state.context.form,
        id: dom.getInputId(state.context),
        role: "spinbutton",
        defaultValue: state.context.formattedValue,
        pattern: state.context.pattern,
        inputMode: state.context.inputMode,
        "aria-invalid": ariaAttr(invalid),
        "data-invalid": dataAttr(invalid),
        disabled,
        "data-disabled": dataAttr(disabled),
        readOnly: state.context.readOnly,
        required: state.context.required,
        autoComplete: "off",
        autoCorrect: "off",
        spellCheck: "false",
        type: "text",
        "aria-roledescription": "numberfield",
        "aria-valuemin": state.context.min,
        "aria-valuemax": state.context.max,
        "aria-valuenow": Number.isNaN(state.context.valueAsNumber) ? undefined : state.context.valueAsNumber,
        "aria-valuetext": state.context.valueText,
        onFocus() {
          send("INPUT.FOCUS")
        },
        onBlur() {
          send({ type: "INPUT.COMMIT", src: "blur" })
        },
        onChange(event) {
          send({ type: "INPUT.CHANGE", target: event.currentTarget, hint: "set" })
        },
        onBeforeInput(event) {
          try {
            const { selectionStart, selectionEnd, value } = event.currentTarget

            const nextValue = value.slice(0, selectionStart!) + ((event as any).data ?? "") + value.slice(selectionEnd!)
            const isValid = state.context.parser.isValidPartialNumber(nextValue)

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

          const step = getEventStep(event) * state.context.step

          const keyMap: EventKeyMap = {
            ArrowUp() {
              send({ type: "INPUT.ARROW_UP", step })
              event.preventDefault()
            },
            ArrowDown() {
              send({ type: "INPUT.ARROW_DOWN", step })
              event.preventDefault()
            },
            Home() {
              send("INPUT.HOME")
              event.preventDefault()
            },
            End() {
              send("INPUT.END")
              event.preventDefault()
            },
            Enter() {
              send({ type: "INPUT.COMMIT", src: "enter" })
            },
          }

          const exec = keyMap[event.key]
          exec?.(event)
        },
      })
    },

    getDecrementTriggerProps() {
      return normalize.button({
        ...parts.decrementTrigger.attrs,
        dir: state.context.dir,
        id: dom.getDecrementTriggerId(state.context),
        disabled: isDecrementDisabled,
        "data-disabled": dataAttr(isDecrementDisabled),
        "aria-label": translations.decrementLabel,
        type: "button",
        tabIndex: -1,
        "aria-controls": dom.getInputId(state.context),
        onPointerDown(event) {
          if (isDecrementDisabled || !isLeftClick(event)) return
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
        ...parts.incrementTrigger.attrs,
        dir: state.context.dir,
        id: dom.getIncrementTriggerId(state.context),
        disabled: isIncrementDisabled,
        "data-disabled": dataAttr(isIncrementDisabled),
        "aria-label": translations.incrementLabel,
        type: "button",
        tabIndex: -1,
        "aria-controls": dom.getInputId(state.context),
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
      return normalize.element({
        ...parts.scrubber.attrs,
        dir: state.context.dir,
        "data-disabled": dataAttr(disabled),
        id: dom.getScrubberId(state.context),
        role: "presentation",
        onMouseDown(event) {
          if (disabled) return

          const point = getEventPoint(event)

          point.x = point.x - roundToDevicePixel(7.5)
          point.y = point.y - roundToDevicePixel(7.5)

          send({ type: "SCRUBBER.PRESS_DOWN", point })
          event.preventDefault()
        },
        style: {
          cursor: disabled ? undefined : "ew-resize",
        },
      })
    },
  }
}
