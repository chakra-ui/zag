import { contains, dataAttr, isSelfTarget, visuallyHiddenStyle } from "@zag-js/dom-query"
import { formatBytes } from "@zag-js/i18n-utils"
import { type NormalizeProps, type PropTypes } from "@zag-js/types"
import { parts } from "./file-upload.anatomy"
import { dom } from "./file-upload.dom"
import { type MachineApi, type Send, type State } from "./file-upload.types"
import { isEventWithFiles } from "./file-upload.utils"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const disabled = state.context.disabled
  const allowDrop = state.context.allowDrop
  const translations = state.context.translations

  const dragging = state.matches("dragging")
  const focused = state.matches("focused") && !disabled

  return {
    dragging: dragging,
    focused: focused,
    openFilePicker() {
      send("OPEN")
    },
    deleteFile(file) {
      send({ type: "FILE.DELETE", file })
    },
    acceptedFiles: state.context.acceptedFiles,
    rejectedFiles: state.context.rejectedFiles,
    setFiles(files) {
      const count = files.length
      send({ type: "FILES.SET", files, count })
    },
    clearRejectedFiles() {
      send({ type: "REJECTED_FILES.CLEAR" })
    },
    clearFiles() {
      send({ type: "FILES.CLEAR" })
    },
    getFileSize(file) {
      return formatBytes(file.size, state.context.locale)
    },
    createFileUrl(file: File, cb: (url: string) => void) {
      const win = dom.getWin(state.context)
      const url = win.URL.createObjectURL(file)
      cb(url)
      return () => win.URL.revokeObjectURL(url)
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        dir: state.context.dir,
        id: dom.getRootId(state.context),
        "data-disabled": dataAttr(disabled),
        "data-dragging": dataAttr(dragging),
      })
    },

    getDropzoneProps() {
      return normalize.element({
        ...parts.dropzone.attrs,
        dir: state.context.dir,
        id: dom.getDropzoneId(state.context),
        tabIndex: disabled ? undefined : 0,
        "aria-disabled": disabled,
        "aria-invalid": state.context.invalid,
        "data-invalid": dataAttr(state.context.invalid),
        "data-disabled": dataAttr(disabled),
        "data-dragging": dataAttr(dragging),
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (!isSelfTarget(event)) return
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
      })
    },

    getTriggerProps() {
      return normalize.button({
        ...parts.trigger.attrs,
        dir: state.context.dir,
        id: dom.getTriggerId(state.context),
        disabled,
        "data-disabled": dataAttr(disabled),
        type: "button",
        onClick(event) {
          if (disabled) return
          // if trigger is wrapped within the dropzone, stop propagation to avoid double opening
          if (contains(dom.getDropzoneEl(state.context), event.currentTarget)) {
            event.stopPropagation()
          }
          send("OPEN")
        },
      })
    },

    getHiddenInputProps() {
      return normalize.input({
        id: dom.getHiddenInputId(state.context),
        tabIndex: -1,
        disabled,
        type: "file",
        required: state.context.required,
        capture: state.context.capture,
        name: state.context.name,
        accept: state.context.acceptAttr,
        webkitdirectory: state.context.capture ? "" : undefined,
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
      })
    },

    getItemGroupProps() {
      return normalize.element({
        ...parts.itemGroup.attrs,
        dir: state.context.dir,
        "data-disabled": dataAttr(disabled),
      })
    },

    getItemProps(props) {
      const { file } = props
      return normalize.element({
        ...parts.item.attrs,
        dir: state.context.dir,
        id: dom.getItemId(state.context, file.name),
        "data-disabled": dataAttr(disabled),
      })
    },

    getItemNameProps(props) {
      const { file } = props
      return normalize.element({
        ...parts.itemName.attrs,
        dir: state.context.dir,
        id: dom.getItemNameId(state.context, file.name),
        "data-disabled": dataAttr(disabled),
      })
    },

    getItemSizeTextProps(props) {
      const { file } = props
      return normalize.element({
        ...parts.itemSizeText.attrs,
        dir: state.context.dir,
        id: dom.getItemSizeTextId(state.context, file.name),
        "data-disabled": dataAttr(disabled),
      })
    },

    getItemPreviewProps(props) {
      const { file } = props
      return normalize.element({
        ...parts.itemPreview.attrs,
        dir: state.context.dir,
        id: dom.getItemPreviewId(state.context, file.name),
        "data-disabled": dataAttr(disabled),
      })
    },

    getItemPreviewImageProps(props) {
      const { file, url } = props
      const isImage = file.type.startsWith("image/")
      if (!isImage) {
        throw new Error("Preview Image is only supported for image files")
      }
      return normalize.img({
        ...parts.itemPreviewImage.attrs,
        alt: translations.itemPreview(file),
        src: url,
        "data-disabled": dataAttr(disabled),
      })
    },

    getItemDeleteTriggerProps(props) {
      const { file } = props
      return normalize.button({
        ...parts.itemDeleteTrigger.attrs,
        dir: state.context.dir,
        type: "button",
        disabled,
        "data-disabled": dataAttr(disabled),
        "aria-label": translations.deleteFile(file),
        onClick() {
          if (disabled) return
          send({ type: "FILE.DELETE", file })
        },
      })
    },

    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs,
        dir: state.context.dir,
        id: dom.getLabelId(state.context),
        htmlFor: dom.getHiddenInputId(state.context),
        "data-disabled": dataAttr(disabled),
      })
    },
  }
}
