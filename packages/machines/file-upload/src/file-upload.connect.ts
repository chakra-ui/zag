import { contains, dataAttr, isSelfEvent } from "@zag-js/dom-query"
import { type NormalizeProps, type PropTypes } from "@zag-js/types"
import { visuallyHiddenStyle } from "@zag-js/visually-hidden"
import { parts } from "./file-upload.anatomy"
import { dom } from "./file-upload.dom"
import { type MachineApi, type Send, type State } from "./file-upload.types"
import { isEventWithFiles } from "./file-upload.utils"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const disabled = state.context.disabled
  const isDragging = state.matches("dragging")
  const isFocused = state.matches("focused") && !disabled
  const allowDrop = state.context.allowDrop

  return {
    isDragging,
    isFocused,
    open() {
      send("OPEN")
    },
    deleteFile(file: File) {
      send({ type: "FILE.DELETE", file })
    },
    files: state.context.files,
    setValue(files: File[]) {
      const count = files.length
      send({ type: "VALUE.SET", files, count })
    },
    clearValue() {
      send({ type: "VALUE.SET", files: [] })
    },

    rootProps: normalize.element({
      ...parts.root.attrs,
      id: dom.getRootId(state.context),
      "data-disabled": dataAttr(disabled),
      "data-dragging": dataAttr(isDragging),
    }),

    dropzoneProps: normalize.element({
      ...parts.dropzone.attrs,
      id: dom.getDropzoneId(state.context),
      tabIndex: disabled ? undefined : 0,
      "aria-disabled": disabled,
      "aria-invalid": state.context.invalid,
      "data-invalid": dataAttr(state.context.invalid),
      "data-disabled": dataAttr(disabled),
      "data-dragging": dataAttr(isDragging),
      onKeyDown(event) {
        if (!isSelfEvent(event)) return
        if (event.key !== "Enter" && event.key !== " ") return
        send({ type: "DROPZONE.CLICK", src: "keydown" })
      },
      onClick(event) {
        const isLabel = event.currentTarget.localName === "label"
        // prevent opening the file dialog when clicking on the label (to avoid double opening)
        if (isLabel) event.preventDefault()
        send("DROPZONE.CLICK")
      },
      onDragOver(event) {
        if (!allowDrop) return
        event.preventDefault()
        event.stopPropagation()
        try {
          event.dataTransfer.dropEffect = "copy"
        } catch {}

        const hasFiles = isEventWithFiles(event)
        if (!hasFiles) return

        const count = event.dataTransfer.items.length
        send({ type: "DROPZONE.DRAG_OVER", count })
      },
      onDragLeave(event) {
        if (!allowDrop || disabled) return
        if (contains(event.currentTarget, event.relatedTarget)) return
        send({ type: "DROPZONE.DRAG_LEAVE" })
      },
      onDrop(event) {
        if (allowDrop) {
          event.preventDefault()
          event.stopPropagation()
        }

        const hasFiles = isEventWithFiles(event)
        if (disabled || !hasFiles) return

        send({ type: "DROPZONE.DROP", files: Array.from(event.dataTransfer.files) })
      },
      onFocus() {
        send("DROPZONE.FOCUS")
      },
      onBlur() {
        send("DROPZONE.BLUR")
      },
    }),

    triggerProps: normalize.button({
      ...parts.trigger.attrs,
      id: dom.getTriggerId(state.context),
      disabled,
      "data-disabled": dataAttr(disabled),
      type: "button",
      onClick() {
        if (disabled) return
        send("OPEN")
      },
    }),

    hiddenInputProps: normalize.input({
      id: dom.getHiddenInputId(state.context),
      tabIndex: -1,
      disabled,
      type: "file",
      name: state.context.name,
      accept: state.context.acceptAttr,
      multiple: state.context.multiple || state.context.maxFiles > 1,
      onClick(event) {
        event.stopPropagation()
        // allow for re-selection of the same file
        event.currentTarget.value = ""
      },
      onChange(event) {
        if (disabled) return
        const { files } = event.currentTarget
        send({ type: "FILES.SET", files: files ? Array.from(files) : [] })
      },
      style: visuallyHiddenStyle,
    }),

    getDeleteTriggerProps(props: { file: File }) {
      const { file } = props
      return normalize.button({
        ...parts.deleteTrigger.attrs,
        type: "button",
        disabled,
        "data-disabled": dataAttr(disabled),
        "aria-label": `Delete ${file.name} file`,
        onClick() {
          if (disabled) return
          send({ type: "FILE.DELETE", file })
        },
      })
    },

    labelProps: normalize.label({
      ...parts.label.attrs,
      id: dom.getLabelId(state.context),
      htmlFor: dom.getHiddenInputId(state.context),
      "data-disabled": dataAttr(disabled),
    }),
  }
}
