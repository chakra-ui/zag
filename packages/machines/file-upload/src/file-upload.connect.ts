import { contains, dataAttr, getEventTarget, visuallyHiddenStyle } from "@zag-js/dom-query"
import { getFileEntries } from "@zag-js/file-utils"
import { formatBytes } from "@zag-js/i18n-utils"
import { type NormalizeProps, type PropTypes } from "@zag-js/types"
import { flatArray } from "@zag-js/utils"
import { parts } from "./file-upload.anatomy"
import * as dom from "./file-upload.dom"
import type { FileUploadApi, FileUploadService, ItemType } from "./file-upload.types"
import { isEventWithFiles } from "./file-upload.utils"

const DEFAULT_ITEM_TYPE: ItemType = "accepted"

const INTERACTIVE_SELECTOR =
  "button, a[href], input:not([type='file']), select, textarea, [tabindex], [contenteditable]"

function isInteractiveTarget(element: HTMLElement | null, container: HTMLElement): boolean {
  if (!element || element.getAttribute("type") === "file") return false
  const interactive = element.closest(INTERACTIVE_SELECTOR)
  return interactive != container && contains(container, interactive)
}

export function connect<T extends PropTypes>(
  service: FileUploadService,
  normalize: NormalizeProps<T>,
): FileUploadApi<T> {
  const { state, send, prop, computed, scope, context } = service
  const disabled = !!prop("disabled")
  const readOnly = !!prop("readOnly")
  const required = !!prop("required")
  const allowDrop = prop("allowDrop")
  const translations = prop("translations")

  const dragging = state.matches("dragging")
  const focused = state.matches("focused") && !disabled

  const acceptedFiles = context.get("acceptedFiles")
  const maxFiles = prop("maxFiles")

  return {
    dragging,
    focused,
    disabled,
    readOnly,
    transforming: context.get("transforming"),
    maxFilesReached: acceptedFiles.length >= maxFiles,
    remainingFiles: Math.max(0, maxFiles - acceptedFiles.length),
    openFilePicker() {
      if (disabled || readOnly) return
      send({ type: "OPEN" })
    },
    deleteFile(file, type = DEFAULT_ITEM_TYPE) {
      if (disabled || readOnly) return
      send({ type: "FILE.DELETE", file, itemType: type })
    },
    acceptedFiles,
    rejectedFiles: context.get("rejectedFiles"),
    setFiles(files) {
      if (disabled || readOnly) return
      send({ type: "FILES.SET", files, count: files.length })
    },
    clearRejectedFiles() {
      if (disabled || readOnly) return
      send({ type: "REJECTED_FILES.CLEAR" })
    },
    clearFiles() {
      if (disabled || readOnly) return
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
      if (disabled || readOnly) return false
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
        "data-readonly": dataAttr(readOnly),
        "data-dragging": dataAttr(dragging),
      })
    },

    getDropzoneProps(props = {}) {
      return normalize.element({
        ...parts.dropzone.attrs,
        dir: prop("dir"),
        id: dom.getDropzoneId(scope),
        tabIndex: disabled || readOnly || props.disableClick ? undefined : 0,
        role: props.disableClick ? "application" : "button",
        "aria-label": translations.dropzone,
        "aria-disabled": disabled,
        "aria-readonly": readOnly,
        "data-invalid": dataAttr(prop("invalid")),
        "data-disabled": dataAttr(disabled),
        "data-readonly": dataAttr(readOnly),
        "data-dragging": dataAttr(dragging),
        onKeyDown(event) {
          if (disabled || readOnly) return
          if (event.defaultPrevented) return

          const target = getEventTarget<HTMLElement>(event)
          if (!contains(event.currentTarget, target)) return
          if (isInteractiveTarget(target, event.currentTarget)) return

          if (props.disableClick) return
          if (event.key !== "Enter" && event.key !== " ") return
          send({ type: "DROPZONE.CLICK", src: "keydown" })
        },
        onClick(event) {
          if (disabled || readOnly) return
          if (event.defaultPrevented) return
          if (props.disableClick) return

          const target = getEventTarget<HTMLElement>(event)
          if (!contains(event.currentTarget, target)) return
          if (isInteractiveTarget(target, event.currentTarget)) return

          // prevent opening the file dialog when clicking on the label (to avoid double opening)
          if (event.currentTarget.localName === "label") {
            event.preventDefault()
          }
          send({ type: "DROPZONE.CLICK" })
        },
        onDragOver(event) {
          if (disabled || readOnly) return
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
          if (disabled || readOnly) return
          if (!allowDrop) return
          if (contains(event.currentTarget, event.relatedTarget)) return
          send({ type: "DROPZONE.DRAG_LEAVE" })
        },
        onDrop(event) {
          if (disabled || readOnly) return
          if (allowDrop) {
            event.preventDefault()
            event.stopPropagation()
          }

          const hasFiles = isEventWithFiles(event)
          if (!hasFiles) return

          getFileEntries(event.dataTransfer.items, prop("directory")).then((files) => {
            send({ type: "DROPZONE.DROP", files: flatArray(files) })
          })
        },
        onFocus() {
          if (disabled || readOnly) return
          send({ type: "DROPZONE.FOCUS" })
        },
        onBlur() {
          if (disabled || readOnly) return
          send({ type: "DROPZONE.BLUR" })
        },
      })
    },

    getTriggerProps() {
      return normalize.button({
        ...parts.trigger.attrs,
        dir: prop("dir"),
        id: dom.getTriggerId(scope),
        disabled: disabled || readOnly,
        "data-disabled": dataAttr(disabled),
        "data-readonly": dataAttr(readOnly),
        "data-invalid": dataAttr(prop("invalid")),
        type: "button",
        onClick(event) {
          if (disabled || readOnly) return
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
        disabled: disabled || readOnly,
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
          if (disabled || readOnly) return
          const { files } = event.currentTarget
          send({ type: "FILE.SELECT", files: files ? Array.from(files) : [] })
        },
        style: visuallyHiddenStyle,
      })
    },

    getItemGroupProps(props = {}) {
      const { type = DEFAULT_ITEM_TYPE } = props
      return normalize.element({
        ...parts.itemGroup.attrs,
        dir: prop("dir"),
        "data-disabled": dataAttr(disabled),
        "data-type": type,
      })
    },

    getItemProps(props) {
      const { file, type = DEFAULT_ITEM_TYPE } = props
      return normalize.element({
        ...parts.item.attrs,
        dir: prop("dir"),
        id: dom.getItemId(scope, dom.getFileId(file)),
        "data-disabled": dataAttr(disabled),
        "data-type": type,
      })
    },

    getItemNameProps(props) {
      const { file, type = DEFAULT_ITEM_TYPE } = props
      return normalize.element({
        ...parts.itemName.attrs,
        dir: prop("dir"),
        id: dom.getItemNameId(scope, dom.getFileId(file)),
        "data-disabled": dataAttr(disabled),
        "data-type": type,
      })
    },

    getItemSizeTextProps(props) {
      const { file, type = DEFAULT_ITEM_TYPE } = props
      return normalize.element({
        ...parts.itemSizeText.attrs,
        dir: prop("dir"),
        id: dom.getItemSizeTextId(scope, dom.getFileId(file)),
        "data-disabled": dataAttr(disabled),
        "data-type": type,
      })
    },

    getItemPreviewProps(props) {
      const { file, type = DEFAULT_ITEM_TYPE } = props
      return normalize.element({
        ...parts.itemPreview.attrs,
        dir: prop("dir"),
        id: dom.getItemPreviewId(scope, dom.getFileId(file)),
        "data-disabled": dataAttr(disabled),
        "data-type": type,
      })
    },

    getItemPreviewImageProps(props) {
      const { file, url, type = DEFAULT_ITEM_TYPE } = props
      const isImage = file.type.startsWith("image/")
      if (!isImage) {
        throw new Error("Preview Image is only supported for image files")
      }
      return normalize.img({
        ...parts.itemPreviewImage.attrs,
        alt: translations.itemPreview?.(file),
        src: url,
        "data-disabled": dataAttr(disabled),
        "data-type": type,
      })
    },

    getItemDeleteTriggerProps(props) {
      const { file, type = DEFAULT_ITEM_TYPE } = props
      return normalize.button({
        ...parts.itemDeleteTrigger.attrs,
        dir: prop("dir"),
        id: dom.getItemDeleteTriggerId(scope, dom.getFileId(file)),
        type: "button",
        disabled: disabled || readOnly,
        "data-disabled": dataAttr(disabled),
        "data-readonly": dataAttr(readOnly),
        "data-type": type,
        "aria-label": translations.deleteFile?.(file),
        onClick() {
          if (disabled || readOnly) return
          send({ type: "FILE.DELETE", file, itemType: type })
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
        disabled: disabled || readOnly,
        hidden: acceptedFiles.length === 0,
        "data-disabled": dataAttr(disabled),
        "data-readonly": dataAttr(readOnly),
        onClick(event) {
          if (event.defaultPrevented) return
          if (disabled || readOnly) return
          send({ type: "FILES.CLEAR" })
        },
      })
    },
  }
}
