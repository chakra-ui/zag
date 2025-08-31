import { contains, dataAttr, isSelfTarget, visuallyHiddenStyle } from "@zag-js/dom-query"
import { getFileEntries } from "@zag-js/file-utils"
import { formatBytes } from "@zag-js/i18n-utils"
import { type NormalizeProps, type PropTypes } from "@zag-js/types"
import { flatArray } from "@zag-js/utils"
import { parts } from "./file-upload.anatomy"
import * as dom from "./file-upload.dom"
import type { FileUploadApi, FileUploadService } from "./file-upload.types"
import { isEventWithFiles } from "./file-upload.utils"

export function connect<T extends PropTypes>(
  service: FileUploadService,
  normalize: NormalizeProps<T>,
): FileUploadApi<T> {
  const { state, send, prop, computed, scope, context } = service
  const disabled = !!prop("disabled")
  const required = !!prop("required")
  const allowDrop = prop("allowDrop")
  const translations = prop("translations")

  const dragging = state.matches("dragging")
  const focused = state.matches("focused") && !disabled

  return {
    dragging,
    focused,
    disabled: !!disabled,
    transforming: context.get("transforming"),
    openFilePicker() {
      if (disabled) return
      send({ type: "OPEN" })
    },
    deleteFile(file) {
      send({ type: "FILE.DELETE", file })
    },
    acceptedFiles: context.get("acceptedFiles"),
    rejectedFiles: context.get("rejectedFiles"),
    setFiles(files) {
      send({ type: "FILES.SET", files, count: files.length })
    },
    clearRejectedFiles() {
      send({ type: "REJECTED_FILES.CLEAR" })
    },
    clearFiles() {
      send({ type: "FILES.CLEAR" })
    },
    getFileSize(file) {
      return formatBytes(file.size, prop("locale"))
    },
    createFileUrl(file: File, cb: (url: string) => void) {
      const win = scope.getWin()
      const url = win.URL.createObjectURL(file)
      cb(url)
      return () => win.URL.revokeObjectURL(url)
    },
    setClipboardFiles(dt) {
      if (disabled) return false
      const items = Array.from(dt?.items ?? [])
      const files = items.reduce<File[]>((acc, item) => {
        if (item.kind !== "file") return acc
        const file = item.getAsFile()
        if (!file) return acc
        return [...acc, file]
      }, [])
      if (!files.length) return false
      send({ type: "FILES.SET", files })
      return true
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        dir: prop("dir"),
        id: dom.getRootId(scope),
        "data-disabled": dataAttr(disabled),
        "data-dragging": dataAttr(dragging),
      })
    },

    getDropzoneProps(props = {}) {
      return normalize.element({
        ...parts.dropzone.attrs,
        dir: prop("dir"),
        id: dom.getDropzoneId(scope),
        tabIndex: disabled || props.disableClick ? undefined : 0,
        role: props.disableClick ? "application" : "button",
        "aria-label": translations.dropzone,
        "aria-disabled": disabled,
        "data-invalid": dataAttr(prop("invalid")),
        "data-disabled": dataAttr(disabled),
        "data-dragging": dataAttr(dragging),
        onKeyDown(event) {
          if (disabled) return
          if (event.defaultPrevented) return
          if (!isSelfTarget(event)) return
          if (props.disableClick) return
          if (event.key !== "Enter" && event.key !== " ") return
          send({ type: "DROPZONE.CLICK", src: "keydown" })
        },
        onClick(event) {
          if (disabled) return
          if (event.defaultPrevented) return
          if (props.disableClick) return
          // ensure it's the dropzone that's actually clicked
          if (!isSelfTarget(event)) return
          // prevent opening the file dialog when clicking on the label (to avoid double opening)
          if (event.currentTarget.localName === "label") {
            event.preventDefault()
          }
          send({ type: "DROPZONE.CLICK" })
        },
        onDragOver(event) {
          if (disabled) return
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
          if (disabled) return
          if (!allowDrop) return
          if (contains(event.currentTarget, event.relatedTarget)) return
          send({ type: "DROPZONE.DRAG_LEAVE" })
        },
        onDrop(event) {
          if (disabled) return
          if (allowDrop) {
            event.preventDefault()
            event.stopPropagation()
          }

          const hasFiles = isEventWithFiles(event)
          if (disabled || !hasFiles) return

          getFileEntries(event.dataTransfer.items, prop("directory")).then((files) => {
            send({ type: "DROPZONE.DROP", files: flatArray(files) })
          })
        },
        onFocus() {
          if (disabled) return
          send({ type: "DROPZONE.FOCUS" })
        },
        onBlur() {
          if (disabled) return
          send({ type: "DROPZONE.BLUR" })
        },
      })
    },

    getTriggerProps() {
      return normalize.button({
        ...parts.trigger.attrs,
        dir: prop("dir"),
        id: dom.getTriggerId(scope),
        disabled,
        "data-disabled": dataAttr(disabled),
        "data-invalid": dataAttr(prop("invalid")),
        type: "button",
        onClick(event) {
          if (disabled) return
          // if trigger is wrapped within the dropzone, stop propagation to avoid double opening
          if (contains(dom.getDropzoneEl(scope), event.currentTarget)) {
            event.stopPropagation()
          }
          send({ type: "OPEN" })
        },
      })
    },

    getHiddenInputProps() {
      return normalize.input({
        id: dom.getHiddenInputId(scope),
        tabIndex: -1,
        disabled,
        type: "file",
        required: prop("required"),
        capture: prop("capture"),
        name: prop("name"),
        accept: computed("acceptAttr"),
        webkitdirectory: prop("directory") ? "" : undefined,
        multiple: computed("multiple") || prop("maxFiles") > 1,
        onClick(event) {
          event.stopPropagation()
          // allow for re-selection of the same file
          event.currentTarget.value = ""
        },
        onInput(event) {
          if (disabled) return
          const { files } = event.currentTarget
          send({ type: "FILE.SELECT", files: files ? Array.from(files) : [] })
        },
        style: visuallyHiddenStyle,
      })
    },

    getItemGroupProps() {
      return normalize.element({
        ...parts.itemGroup.attrs,
        dir: prop("dir"),
        "data-disabled": dataAttr(disabled),
      })
    },

    getItemProps(props) {
      const { file } = props
      return normalize.element({
        ...parts.item.attrs,
        dir: prop("dir"),
        id: dom.getItemId(scope, file.name),
        "data-disabled": dataAttr(disabled),
      })
    },

    getItemNameProps(props) {
      const { file } = props
      return normalize.element({
        ...parts.itemName.attrs,
        dir: prop("dir"),
        id: dom.getItemNameId(scope, file.name),
        "data-disabled": dataAttr(disabled),
      })
    },

    getItemSizeTextProps(props) {
      const { file } = props
      return normalize.element({
        ...parts.itemSizeText.attrs,
        dir: prop("dir"),
        id: dom.getItemSizeTextId(scope, file.name),
        "data-disabled": dataAttr(disabled),
      })
    },

    getItemPreviewProps(props) {
      const { file } = props
      return normalize.element({
        ...parts.itemPreview.attrs,
        dir: prop("dir"),
        id: dom.getItemPreviewId(scope, file.name),
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
        alt: translations.itemPreview?.(file),
        src: url,
        "data-disabled": dataAttr(disabled),
      })
    },

    getItemDeleteTriggerProps(props) {
      const { file } = props
      return normalize.button({
        ...parts.itemDeleteTrigger.attrs,
        dir: prop("dir"),
        type: "button",
        disabled,
        "data-disabled": dataAttr(disabled),
        "aria-label": translations.deleteFile?.(file),
        onClick() {
          if (disabled) return
          send({ type: "FILE.DELETE", file })
        },
      })
    },

    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs,
        dir: prop("dir"),
        id: dom.getLabelId(scope),
        htmlFor: dom.getHiddenInputId(scope),
        "data-disabled": dataAttr(disabled),
        "data-required": dataAttr(required),
      })
    },

    getClearTriggerProps() {
      return normalize.button({
        ...parts.clearTrigger.attrs,
        dir: prop("dir"),
        type: "button",
        disabled,
        hidden: context.get("acceptedFiles").length === 0,
        "data-disabled": dataAttr(disabled),
        onClick(event) {
          if (event.defaultPrevented) return
          if (disabled) return
          send({ type: "FILES.CLEAR" })
        },
      })
    },
  }
}
