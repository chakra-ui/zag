import { dataAttr, isSelfEvent } from "@zag-js/dom-query"
import { NormalizeProps, type PropTypes } from "@zag-js/types"
import { visuallyHiddenStyle } from "@zag-js/visually-hidden"
import { parts } from "./file-upload.anatomy"
import { dom } from "./file-upload.dom"
import { Send, State } from "./file-upload.types"
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
    /**
     * Function to set the value
     */
    setValue(files: File[]) {
      send({ type: "VALUE.SET", files })
    },
    /**
     * Function to clear the value
     */
    clearValue() {
      send("VALUE.CLEAR")
    },

    rootProps: normalize.element({
      ...parts.root.attrs,
      id: dom.getRootId(state.context),
      tabIndex: disabled ? undefined : 0,
      "aria-disabled": disabled,
      "data-disabled": dataAttr(disabled),
      "data-dragging": dataAttr(isDragging),
      onKeyDown(event) {
        if (!isSelfEvent(event)) return
        if (event.key !== "Enter" && event.key !== " ") return
        send("ROOT.CLICK")
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
      onDragLeave() {
        if (!state.context.dropzone || disabled) return
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
      type: "button",
      onClick() {
        if (disabled) return
        send("OPEN")
      },
    }),

    inputProps: normalize.input({
      ...parts.input.attrs,
      tabIndex: -1,
      disabled,
      type: "file",
      name: state.context.name,
      accept: state.context.acceptAttr,
      multiple: state.context.multiple,
      id: dom.getInputId(state.context),
      onClick(event) {
        event.stopPropagation()
      },
      onChange(event) {
        send({ type: "INPUT.CHANGE", files: event.currentTarget.files })
      },
      style: visuallyHiddenStyle,
    }),
  }
}
