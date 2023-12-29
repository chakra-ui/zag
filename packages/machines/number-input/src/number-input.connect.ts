import { getEventPoint, getEventStep, getNativeEvent, isLeftClick, type EventKeyMap } from "@zag-js/dom-event"
import { ariaAttr, dataAttr } from "@zag-js/dom-query"
import { roundToDevicePixel } from "@zag-js/number-utils"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./number-input.anatomy"
import { dom } from "./number-input.dom"
import type { MachineApi, Send, State } from "./number-input.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const isFocused = state.hasTag("focus")
  const isInvalid = state.context.isOutOfRange || !!state.context.invalid

  const isValueEmpty = state.context.isValueEmpty

  const isDisabled = state.context.isDisabled
  const isReadOnly = state.context.readOnly

  const isIncrementDisabled = isDisabled || !state.context.canIncrement || isReadOnly
  const isDecrementDisabled = isDisabled || !state.context.canDecrement || isReadOnly

  const translations = state.context.translations

  return {
    isFocused,
    isInvalid,
    isValueEmpty,
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

    rootProps: normalize.element({
      id: dom.getRootId(state.context),
      ...parts.root.attrs,
      dir: state.context.dir,
      "data-disabled": dataAttr(isDisabled),
      "data-focus": dataAttr(isFocused),
      "data-invalid": dataAttr(isInvalid),
    }),

    labelProps: normalize.label({
      ...parts.label.attrs,
      dir: state.context.dir,
      "data-disabled": dataAttr(isDisabled),
      "data-focus": dataAttr(isFocused),
      "data-invalid": dataAttr(isInvalid),
      id: dom.getLabelId(state.context),
      htmlFor: dom.getInputId(state.context),
    }),

    controlProps: normalize.element({
      ...parts.control.attrs,
      dir: state.context.dir,
      role: "group",
      "aria-disabled": isDisabled,
      "data-focus": dataAttr(isFocused),
      "data-disabled": dataAttr(isDisabled),
      "data-invalid": dataAttr(isInvalid),
      "aria-invalid": ariaAttr(state.context.invalid),
    }),

    inputProps: normalize.input({
      ...parts.input.attrs,
      dir: state.context.dir,
      name: state.context.name,
      form: state.context.form,
      id: dom.getInputId(state.context),
      role: "spinbutton",
      defaultValue: state.context.formattedValue,
      pattern: state.context.pattern,
      inputMode: state.context.inputMode,
      "aria-invalid": ariaAttr(isInvalid),
      "data-invalid": dataAttr(isInvalid),
      disabled: isDisabled,
      "data-disabled": dataAttr(isDisabled),
      readOnly: !!state.context.readOnly,
      autoComplete: "off",
      autoCorrect: "off",
      spellCheck: "false",
      type: "text",
      "aria-roledescription": "numberfield",
      "aria-valuemin": state.context.min,
      "aria-valuemax": state.context.max,
      "aria-valuenow": Number.isNaN(state.context.valueAsNumber) ? undefined : state.context.valueAsNumber,
      "aria-valuetext": state.context.valueText,
      onCompositionStart() {
        send("INPUT.COMPOSITION_START")
      },
      onCompositionEnd() {
        send("INPUT.COMPOSITION_END")
      },
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
        if (state.context.readOnly) return

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
            if (state.context.composing) return
            send({ type: "INPUT.COMMIT", src: "enter" })
          },
        }

        const exec = keyMap[event.key]
        exec?.(event)
      },
    }),

    decrementTriggerProps: normalize.button({
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
    }),

    incrementTriggerProps: normalize.button({
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
    }),

    scrubberProps: normalize.element({
      ...parts.scrubber.attrs,
      dir: state.context.dir,
      "data-disabled": dataAttr(isDisabled),
      id: dom.getScrubberId(state.context),
      role: "presentation",
      onMouseDown(event) {
        if (isDisabled) return

        const evt = getNativeEvent(event)
        const point = getEventPoint(evt)

        point.x = point.x - roundToDevicePixel(7.5)
        point.y = point.y - roundToDevicePixel(7.5)

        send({ type: "SCRUBBER.PRESS_DOWN", point })
        event.preventDefault()
      },
      style: {
        cursor: isDisabled ? undefined : "ew-resize",
      },
    }),
  }
}
