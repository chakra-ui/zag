import type { Service } from "@zag-js/core"
import { ariaAttr, dataAttr, isApple, isComposingEvent } from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./editable.anatomy"
import * as dom from "./editable.dom"
import type { AreaState, EditableApi, EditableSchema, InputState, LabelState, PreviewState } from "./editable.types"

export function connect<T extends PropTypes>(
  service: Service<EditableSchema>,
  normalize: NormalizeProps<T>,
): EditableApi<T> {
  const { state, context, send, prop, scope, computed } = service
  const disabled = !!prop("disabled")
  const interactive = computed("isInteractive")
  const readOnly = !!prop("readOnly")
  const required = !!prop("required")
  const invalid = !!prop("invalid")
  const autoResize = !!prop("autoResize")
  const translations = prop("translations")

  const editing = state.matches("edit")

  const placeholderProp = prop("placeholder")
  const placeholder =
    typeof placeholderProp === "string" ? { edit: placeholderProp, preview: placeholderProp } : placeholderProp

  const value = context.get("value")
  const empty = value.trim() === ""

  const valueText = empty ? (placeholder?.preview ?? "") : value

  // -----------------------------------------------------------------------------
  // State getters: pure, serializable per-part state, independent of `normalize`
  // -----------------------------------------------------------------------------

  function getAreaState(): AreaState {
    return { editing, disabled, empty }
  }

  function getLabelState(): LabelState {
    return { editing, invalid, required }
  }

  function getInputState(): InputState {
    return { editing, disabled, readOnly, invalid, autoResize }
  }

  function getPreviewState(): PreviewState {
    return { editing, disabled, readOnly, invalid, autoResize, empty }
  }

  // -----------------------------------------------------------------------------
  // Prop getters
  // -----------------------------------------------------------------------------

  return {
    editing,
    empty,
    value,
    valueText,
    setValue(value) {
      send({ type: "VALUE.SET", value, src: "setValue" })
    },
    clearValue() {
      send({ type: "VALUE.SET", value: "", src: "clearValue" })
    },
    edit() {
      if (!interactive) return
      send({ type: "EDIT" })
    },
    cancel() {
      if (!interactive) return
      send({ type: "CANCEL" })
    },
    submit() {
      if (!interactive) return
      send({ type: "SUBMIT" })
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs(scope.id),
        dir: prop("dir"),
      })
    },

    getAreaState,
    getAreaProps() {
      const areaState = getAreaState()
      return normalize.element({
        ...parts.area.attrs(scope.id),
        dir: prop("dir"),
        style: autoResize ? { display: "inline-grid" } : undefined,
        "data-focus": dataAttr(areaState.editing),
        "data-disabled": dataAttr(areaState.disabled),
        "data-placeholder-shown": dataAttr(areaState.empty),
      })
    },

    getLabelState,
    getLabelProps() {
      const labelState = getLabelState()
      return normalize.label({
        ...parts.label.attrs(scope.id),
        id: dom.getLabelId(scope),
        dir: prop("dir"),
        htmlFor: dom.getInputId(scope),
        "data-focus": dataAttr(labelState.editing),
        "data-invalid": dataAttr(labelState.invalid),
        "data-required": dataAttr(labelState.required),
        onClick() {
          if (editing) return
          const previewEl = dom.getPreviewEl(scope)
          previewEl?.focus({ preventScroll: true })
        },
      })
    },

    getInputState,
    getInputProps() {
      const inputState = getInputState()
      return normalize.input({
        ...parts.input.attrs(scope.id),
        dir: prop("dir"),
        "aria-label": translations?.input,
        name: prop("name"),
        form: prop("form"),
        id: dom.getInputId(scope),
        hidden: autoResize ? undefined : !inputState.editing,
        placeholder: placeholder?.edit,
        maxLength: prop("maxLength"),
        required: prop("required"),
        disabled: inputState.disabled,
        "data-disabled": dataAttr(inputState.disabled),
        readOnly: inputState.readOnly,
        "data-readonly": dataAttr(inputState.readOnly),
        "aria-invalid": ariaAttr(inputState.invalid),
        "data-invalid": dataAttr(inputState.invalid),
        "data-autoresize": dataAttr(inputState.autoResize),
        defaultValue: value,
        size: autoResize ? 1 : undefined,
        onChange(event) {
          send({
            type: "VALUE.SET",
            src: "input.change",
            value: event.currentTarget.value,
          })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (isComposingEvent(event)) return

          const keyMap: EventKeyMap = {
            Escape() {
              send({ type: "CANCEL" })
              event.preventDefault()
            },
            Enter(event) {
              if (!computed("submitOnEnter")) return
              const { localName } = event.currentTarget

              // when used as a textarea, we want to allow the user to enter a newline
              if (localName === "textarea") {
                const submitMod = isApple() ? event.metaKey : event.ctrlKey
                if (!submitMod) return
                send({ type: "SUBMIT", src: "keydown.enter" })
                return
              }

              // when used as an input, we want to submit the form
              if (localName === "input" && !event.shiftKey && !event.metaKey) {
                send({ type: "SUBMIT", src: "keydown.enter" })
                event.preventDefault()
              }
            },
          }

          const exec = keyMap[event.key]

          if (exec) {
            exec(event)
          }
        },
        style: autoResize
          ? {
              gridArea: "1 / 1 / auto / auto",
              visibility: !inputState.editing ? "hidden" : undefined,
            }
          : undefined,
      })
    },

    getPreviewState,
    getPreviewProps() {
      const previewState = getPreviewState()
      return normalize.element({
        id: dom.getPreviewId(scope),
        ...parts.preview.attrs(scope.id),
        dir: prop("dir"),
        "data-placeholder-shown": dataAttr(previewState.empty),
        "aria-readonly": ariaAttr(previewState.readOnly),
        "data-readonly": dataAttr(previewState.disabled),
        "data-disabled": dataAttr(previewState.disabled),
        "aria-disabled": ariaAttr(previewState.disabled),
        "aria-invalid": ariaAttr(previewState.invalid),
        "data-invalid": dataAttr(previewState.invalid),
        "aria-label": translations?.edit,
        "data-autoresize": dataAttr(previewState.autoResize),
        children: valueText,
        hidden: autoResize ? undefined : previewState.editing,
        tabIndex: interactive ? 0 : undefined,
        onClick() {
          if (!interactive) return
          if (prop("activationMode") !== "click") return
          send({ type: "EDIT", src: "click" })
        },
        onFocus() {
          if (!interactive) return
          if (prop("activationMode") !== "focus") return
          send({ type: "EDIT", src: "focus" })
        },
        onDoubleClick(event) {
          if (event.defaultPrevented) return
          if (!interactive) return
          if (prop("activationMode") !== "dblclick") return
          send({ type: "EDIT", src: "dblclick" })
        },
        style: autoResize
          ? {
              whiteSpace: "pre",
              gridArea: "1 / 1 / auto / auto",
              visibility: previewState.editing ? "hidden" : undefined,
              // in event the preview overflow's the parent element
              overflow: "hidden",
              textOverflow: "ellipsis",
            }
          : undefined,
      })
    },

    getEditTriggerProps() {
      return normalize.button({
        ...parts.editTrigger.attrs(scope.id),
        id: dom.getEditTriggerId(scope),
        dir: prop("dir"),
        "aria-label": translations?.edit,
        hidden: editing,
        type: "button",
        disabled: disabled,
        onClick(event) {
          if (event.defaultPrevented) return
          if (!interactive) return
          send({ type: "EDIT", src: "edit.click" })
        },
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs(scope.id),
        dir: prop("dir"),
      })
    },

    getSubmitTriggerProps() {
      return normalize.button({
        ...parts.submitTrigger.attrs(scope.id),
        dir: prop("dir"),
        id: dom.getSubmitTriggerId(scope),
        "aria-label": translations?.submit,
        hidden: !editing,
        disabled: disabled,
        type: "button",
        onClick(event) {
          if (event.defaultPrevented) return
          if (!interactive) return
          send({ type: "SUBMIT", src: "submit.click" })
        },
      })
    },

    getCancelTriggerProps() {
      return normalize.button({
        ...parts.cancelTrigger.attrs(scope.id),
        dir: prop("dir"),
        "aria-label": translations?.cancel,
        id: dom.getCancelTriggerId(scope),
        hidden: !editing,
        type: "button",
        disabled: disabled,
        onClick(event) {
          if (event.defaultPrevented) return
          if (!interactive) return
          send({ type: "CANCEL", src: "cancel.click" })
        },
      })
    },
  }
}
