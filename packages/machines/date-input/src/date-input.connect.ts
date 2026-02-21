import { ariaAttr, dataAttr, getEventKey, getNativeEvent, visuallyHiddenStyle } from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./date-input.anatomy"
import * as dom from "./date-input.dom"
import type { DateInputApi, DateInputService, SegmentProps, SegmentState } from "./date-input.types"
import { getLocaleSeparator, isValidCharacter } from "./utils/locale"
import { getSegmentLabel, PAGE_STEP } from "./utils/segments"
import { getGroupOffset } from "./utils/validity"

export function connect<T extends PropTypes>(service: DateInputService, normalize: NormalizeProps<T>): DateInputApi<T> {
  const { state, context, prop, send, computed, scope } = service

  const disabled = Boolean(prop("disabled"))
  const readOnly = Boolean(prop("readOnly"))
  const invalid = Boolean(prop("invalid"))

  const focused = state.matches("focused")
  const locale = prop("locale")
  const separator = getLocaleSeparator(locale)

  function getSegmentState(props: SegmentProps): SegmentState {
    const { segment } = props
    const isEditable = !disabled && !readOnly && segment.isEditable
    return {
      editable: isEditable,
    }
  }

  return {
    focused,
    disabled,
    invalid,
    value: context.get("value"),
    valueAsDate: context
      .get("value")
      .filter((date) => date != null)
      .map((date) => date.toDate(prop("timeZone"))),
    valueAsString: computed("valueAsString"),
    placeholderValue: context.get("placeholderValue"),

    setValue(values) {
      send({ type: "VALUE.SET", value: values })
    },
    clearValue() {
      send({ type: "VALUE.CLEAR" })
    },

    getSegments(props = {}) {
      const { index = 0 } = props
      const allSegments = computed("segments")
      const segments = allSegments[index] ?? []
      const enteredKeys = context.get("enteredKeys")
      const activeIndex = context.get("activeIndex")
      const activeSegmentIndex = context.get("activeSegmentIndex")

      // Show entered keys as segment text while user is typing
      if (focused && enteredKeys && index === activeIndex && activeSegmentIndex >= 0) {
        const localActiveSegmentIndex = activeSegmentIndex - getGroupOffset(allSegments, index)
        return segments.map((seg, i) => {
          if (i !== localActiveSegmentIndex) return seg
          return { ...seg, text: enteredKeys, isPlaceholder: false }
        })
      }

      return segments
    },

    getSegmentState,

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        dir: prop("dir"),
        id: dom.getRootId(scope),
        "data-disabled": dataAttr(disabled),
        "data-readonly": dataAttr(readOnly),
        "data-invalid": dataAttr(invalid),
      })
    },

    getLabelProps(props = {}) {
      const { index = 0 } = props
      return normalize.label({
        ...parts.label.attrs,
        id: dom.getLabelId(scope, index),
        dir: prop("dir"),
        htmlFor: dom.getSegmentGroupId(scope, index),
        "data-disabled": dataAttr(disabled),
        "data-readonly": dataAttr(readOnly),
        "data-invalid": dataAttr(invalid),
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs,
        dir: prop("dir"),
        id: dom.getControlId(scope),
        "data-disabled": dataAttr(disabled),
        "data-readonly": dataAttr(readOnly),
        "data-invalid": dataAttr(invalid),
        "data-focus": dataAttr(focused),
      })
    },

    getSegmentGroupProps(props = {}) {
      const { index = 0 } = props

      return normalize.element({
        ...parts.segmentGroup.attrs,
        id: dom.getSegmentGroupId(scope, index),
        dir: prop("dir"),
        role: "group",
        "aria-labelledby": dom.getLabelId(scope, index),
        "data-disabled": dataAttr(disabled),
        "data-readonly": dataAttr(readOnly),
        "data-invalid": dataAttr(invalid),
        "data-focus": dataAttr(focused),
        style: {
          unicodeBidi: "isolate",
        },
      })
    },

    getSegmentProps(props) {
      const { segment, index = 0 } = props
      const segmentState = getSegmentState(props)

      if (segment.type === "literal") {
        return normalize.element({
          ...parts.segment.attrs,
          dir: prop("dir"),
          "aria-hidden": true,
          "data-type": segment.type,
          "data-readonly": dataAttr(true),
          "data-disabled": dataAttr(true),
        })
      }

      return normalize.element({
        ...parts.segment.attrs,
        dir: prop("dir"),
        role: "spinbutton",
        tabIndex: disabled ? undefined : 0,
        autoComplete: "off",
        spellCheck: segmentState.editable ? "false" : undefined,
        autoCorrect: segmentState.editable ? "off" : undefined,
        contentEditable: segmentState.editable,
        suppressContentEditableWarning: segmentState.editable,
        inputMode:
          disabled || segment.type === "dayPeriod" || segment.type === "era" || !segmentState.editable
            ? undefined
            : "numeric",
        enterKeyHint: "next",
        "aria-label": getSegmentLabel(segment.type),
        "aria-valuenow": segment.isPlaceholder ? undefined : segment.value,
        "aria-valuetext": segment.isPlaceholder ? segment.placeholder : segment.text,
        "aria-valuemin": segment.minValue,
        "aria-valuemax": segment.maxValue,
        "aria-invalid": ariaAttr(invalid),
        "aria-readonly": ariaAttr(!segment.isEditable || readOnly),
        "aria-disabled": ariaAttr(disabled),
        "data-value": segment.value,
        "data-type": segment.type,
        "data-readonly": dataAttr(!segment.isEditable || readOnly),
        "data-disabled": dataAttr(disabled),
        "data-editable": dataAttr(segment.isEditable && !readOnly && !disabled),
        "data-placeholder": dataAttr(segment.isPlaceholder),
        style: {
          caretColor: "transparent",
        },
        onFocus(event) {
          const segmentEls = dom.getSegmentEls(scope)
          const segmentIndex = segmentEls.indexOf(event.currentTarget as HTMLInputElement)
          send({ type: "SEGMENT.FOCUS", dateIndex: index, segmentIndex })
          // Collapse selection to start or Chrome won't fire input events
          const selection = event.currentTarget?.ownerDocument?.getSelection?.()
          if (selection && event.currentTarget) {
            selection.collapse(event.currentTarget)
          }
        },
        onBlur() {
          send({ type: "SEGMENT.BLUR", index: -1 })
        },
        onKeyDown(event) {
          if (
            event.defaultPrevented ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.altKey ||
            readOnly ||
            event.nativeEvent.isComposing
          ) {
            return
          }

          const keyMap: EventKeyMap = {
            ArrowLeft() {
              send({ type: "SEGMENT.ARROW_LEFT" })
            },
            ArrowRight() {
              send({ type: "SEGMENT.ARROW_RIGHT" })
            },
            ArrowUp() {
              send({ type: "SEGMENT.ADJUST", segment, amount: 1 })
            },
            ArrowDown() {
              send({ type: "SEGMENT.ADJUST", segment, amount: -1 })
            },
            PageUp() {
              send({
                type: "SEGMENT.ADJUST",
                segment,
                amount: PAGE_STEP[segment.type] ?? 1,
              })
            },
            PageDown() {
              send({
                type: "SEGMENT.ADJUST",
                segment,
                amount: -(PAGE_STEP[segment.type] ?? 1),
              })
            },
            Backspace() {
              send({ type: "SEGMENT.BACKSPACE", segment })
            },
            Delete() {
              send({ type: "SEGMENT.BACKSPACE", segment })
            },
            Home() {
              send({ type: "SEGMENT.HOME", segment })
            },
            End() {
              send({ type: "SEGMENT.END", segment })
            },
          }

          const exec =
            keyMap[
              getEventKey(event, {
                dir: prop("dir"),
              })
            ]

          if (exec) {
            exec(event)
            event.preventDefault()
            event.stopPropagation()
          }
        },
        onPointerDown(event) {
          event.stopPropagation()
        },
        onMouseDown(event) {
          event.stopPropagation()
        },
        onBeforeInput(event) {
          const { data, inputType } = getNativeEvent(event)
          const allowedInputTypes = ["deleteContentBackward", "deleteContentForward", "deleteByCut", "deleteByDrag"]

          if (allowedInputTypes.includes(inputType)) {
            event.preventDefault()
            return
          }

          if (inputType === "insertFromPaste") {
            event.preventDefault()
            return
          }

          // Handle composition events from Android/iOS
          // Record current state to restore after composition
          if (inputType === "insertCompositionText") {
            const target = event.currentTarget || event.target
            if (target) {
              event.preventDefault()
              // Android sometimes fires key presses as composition events
              if (data != null) {
                send({ type: "SEGMENT.INPUT", segment, input: data })
              }
            }
            return
          }

          // For dayPeriod and era segments, accept letter input (a/p for AM/PM, etc.)
          const isTextSegment = segment.type === "dayPeriod" || segment.type === "era"

          if (data && (isTextSegment || isValidCharacter(data, separator))) {
            event.preventDefault()
            send({ type: "SEGMENT.INPUT", segment, input: data })
          } else {
            event.preventDefault()
          }
        },
        onPaste(event) {
          event.preventDefault()
        },
      })
    },

    getHiddenInputProps(props = {}) {
      const { index = 0, name } = props
      const value = context.get("value")
      const inputName = name || prop("name")

      return normalize.input({
        ...parts.hiddenInput.attrs,
        type: "hidden",
        id: dom.getHiddenInputId(scope, index),
        name: inputName ? (value.length > 1 ? `${inputName}[${index}]` : inputName) : undefined,
        form: prop("form"),
        required: prop("required"),
        disabled,
        readOnly,
        value: computed("valueAsString")[index] ?? "",
        style: visuallyHiddenStyle,
      })
    },
  }
}
