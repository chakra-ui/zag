import { contains, dataAttr, isSelfEvent } from "@zag-js/dom-query"
import { type NormalizeProps, type PropTypes } from "@zag-js/types"
import { visuallyHiddenStyle } from "@zag-js/visually-hidden"
import { parts } from "./file-upload.anatomy"
import { dom } from "./file-upload.dom"
import { type Send, type State } from "./file-upload.types"
import { isEventWithFiles } from "./file-upload.utils"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const disableClick = state.context.disableClick
  const disabled = state.context.disabled
  const isDragging = state.matches("dragging")
  const isFocused = state.matches("focused") && !disabled

  return {
    /**
     * Whether the user is dragging something over the root element
     */
    isDragging,
    /**
     * Whether the user is focused on the root element
     */
    isFocused,
    /**
     * Function to open the file dialog
     */
    openFilePicker() {
      send("OPEN")
    },
    deleteFile(file: File) {
      send({ type: "FILE.DELETE", file })
    },
    /**
     * The files that have been dropped or selected
     */
    files: state.context.files,
    /**
     * Function to set the value
     */
    setValue(files: File[]) {
      const count = files.length
      send({ type: "VALUE.SET", files, count })
    },
    /**
     * Function to clear the value
     */
    clearValue() {
      send({ type: "VALUE.SET", files: [] })
    },

    rootProps: normalize.element({
      ...parts.root.attrs,
      id: dom.getRootId(state.context),
      tabIndex: disabled ? undefined : 0,
      "aria-disabled": disabled,
      "aria-invalid": state.context.invalid,
      "data-invalid": dataAttr(state.context.invalid),
      "data-disabled": dataAttr(disabled),
      "data-dragging": dataAttr(isDragging),
      onKeyDown(event) {
        if (!isSelfEvent(event)) return
        if (event.key !== "Enter" && event.key !== " ") return
        send({ type: "ROOT.CLICK", src: "keydown" })
      },
      onClick(event) {
        if (disableClick) event.preventDefault()
        send("ROOT.CLICK")
      },
      onDragOver(event) {
        if (!state.context.dropzone || disabled) return
        event.preventDefault()
        event.stopPropagation()
        try {
          event.dataTransfer.dropEffect = "copy"
        } catch {}

        const hasFiles = isEventWithFiles(event)
        if (!hasFiles) return

        const count = event.dataTransfer.items.length
        send({ type: "ROOT.DRAG_OVER", count })
      },
      onDragLeave(event) {
        if (!state.context.dropzone || disabled) return
        if (contains(event.currentTarget, event.relatedTarget)) return
        send({ type: "ROOT.DRAG_LEAVE" })
      },
      onDrop(event) {
        if (state.context.dropzone) {
          event.preventDefault()
          event.stopPropagation()
        }

        const hasFiles = isEventWithFiles(event)
        if (disabled || !hasFiles) return

        send({ type: "ROOT.DROP", files: Array.from(event.dataTransfer.files) })
      },
      onFocus() {
        send("ROOT.FOCUS")
      },
      onBlur() {
        send("ROOT.BLUR")
      },
    }),

    triggerProps: normalize.button({
      ...parts.trigger.attrs,
      id: dom.getTriggerId(state.context),
      "data-disabled": dataAttr(disabled),
      type: "button",
      onClick() {
        if (disabled) return
        send("OPEN")
      },
    }),

    inputProps: normalize.input({
      ...parts.input.attrs,
      id: dom.getInputId(state.context),
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
        "data-disabled": dataAttr(disabled),
        "aria-label": `Delete ${file.name} file`,
        onClick() {
          if (disabled) return
          send({ type: "FILE.DELETE", file })
        },
      })
    },
  }
}
