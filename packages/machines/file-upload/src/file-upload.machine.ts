import { createMachine } from "@zag-js/core"
import { addDomEvent, contains, getEventTarget, raf } from "@zag-js/dom-query"
import { getAcceptAttrString, isFileEqual } from "@zag-js/file-utils"
import { callAll } from "@zag-js/utils"
import * as dom from "./file-upload.dom"
import type { FileRejection, FileUploadSchema } from "./file-upload.types"
import { getFilesFromEvent, setInputFiles } from "./file-upload.utils"

export const machine = createMachine<FileUploadSchema>({
  props({ props }) {
    return {
      minFileSize: 0,
      maxFileSize: Number.POSITIVE_INFINITY,
      maxFiles: 1,
      allowDrop: true,
      preventDocumentDrop: true,
      ...props,
      translations: {
        dropzone: "dropzone",
        itemPreview: (file) => `preview of ${file.name}`,
        deleteFile: (file) => `delete file ${file.name}`,
        ...props.translations,
      },
    }
  },

  initialState() {
    return "idle"
  },

  context({ prop, bindable, getContext }) {
    return {
      acceptedFiles: bindable<File[]>(() => ({
        defaultValue: [],
        isEqual: (a, b) => a.length === b?.length && a.every((file, i) => isFileEqual(file, b[i])),
        hash(value) {
          return value.map((file) => `${file.name}-${file.size}`).join(",")
        },
        onChange(value) {
          const ctx = getContext()
          prop("onFileAccept")?.({ files: value })
          prop("onFileChange")?.({ acceptedFiles: value, rejectedFiles: ctx.get("rejectedFiles") })
        },
      })),
      rejectedFiles: bindable<FileRejection[]>(() => ({
        defaultValue: [],
        isEqual: (a, b) => a.length === b?.length && a.every((file, i) => isFileEqual(file.file, b[i].file)),
        onChange(value) {
          const ctx = getContext()
          prop("onFileReject")?.({ files: value })
          prop("onFileChange")?.({ acceptedFiles: ctx.get("acceptedFiles"), rejectedFiles: value })
        },
      })),
    }
  },

  computed: {
    acceptAttr: ({ prop }) => getAcceptAttrString(prop("accept")),
    multiple: ({ prop }) => prop("maxFiles") > 1,
  },

  watch({ track, context, action }) {
    track([() => context.hash("acceptedFiles")], () => {
      action(["syncInputElement"])
    })
  },

  on: {
    "FILES.SET": {
      actions: ["setFilesFromEvent"],
    },
    "FILE.DELETE": {
      actions: ["removeFile"],
    },
    "FILES.CLEAR": {
      actions: ["clearFiles"],
    },
    "REJECTED_FILES.CLEAR": {
      actions: ["clearRejectedFiles"],
    },
  },

  effects: ["preventDocumentDrop"],

  states: {
    idle: {
      on: {
        OPEN: {
          actions: ["openFilePicker"],
        },
        "DROPZONE.CLICK": {
          actions: ["openFilePicker"],
        },
        "DROPZONE.FOCUS": {
          target: "focused",
        },
        "DROPZONE.DRAG_OVER": {
          target: "dragging",
        },
      },
    },
    focused: {
      on: {
        "DROPZONE.BLUR": {
          target: "idle",
        },
        OPEN: {
          actions: ["openFilePicker"],
        },
        "DROPZONE.CLICK": {
          actions: ["openFilePicker"],
        },
        "DROPZONE.DRAG_OVER": {
          target: "dragging",
        },
      },
    },
    dragging: {
      on: {
        "DROPZONE.DROP": {
          target: "idle",
          actions: ["setFilesFromEvent"],
        },
        "DROPZONE.DRAG_LEAVE": {
          target: "idle",
        },
      },
    },
  },

  implementations: {
    effects: {
      preventDocumentDrop({ prop, scope }) {
        if (!prop("preventDocumentDrop")) return
        if (!prop("allowDrop")) return
        if (prop("disabled")) return
        const doc = scope.getDoc()
        const onDragOver = (event: DragEvent) => {
          event?.preventDefault()
        }
        const onDrop = (event: DragEvent) => {
          if (contains(dom.getRootEl(scope), getEventTarget(event))) return
          event.preventDefault()
        }
        return callAll(addDomEvent(doc, "dragover", onDragOver, false), addDomEvent(doc, "drop", onDrop, false))
      },
    },

    actions: {
      syncInputElement({ scope, context }) {
        queueMicrotask(() => {
          const inputEl = dom.getHiddenInputEl(scope)
          if (!inputEl) return
          setInputFiles(inputEl, context.get("acceptedFiles"))
          const win = scope.getWin()
          inputEl.dispatchEvent(new win.Event("change", { bubbles: true }))
        })
      },
      openFilePicker({ scope }) {
        raf(() => {
          dom.getHiddenInputEl(scope)?.click()
        })
      },
      setFilesFromEvent(params) {
        const { computed, context, event } = params
        const result = getFilesFromEvent(params, event.files)
        const { acceptedFiles, rejectedFiles } = result

        if (computed("multiple")) {
          context.set("acceptedFiles", (prev) => [...prev, ...acceptedFiles])
          context.set("rejectedFiles", rejectedFiles)
          return
        }

        if (acceptedFiles.length) {
          const files = [acceptedFiles[0]]
          context.set("acceptedFiles", files)
          context.set("rejectedFiles", rejectedFiles)
        } else if (rejectedFiles.length) {
          context.set("acceptedFiles", context.get("acceptedFiles"))
          context.set("rejectedFiles", rejectedFiles)
        }
      },
      removeFile({ context, event }) {
        const files = context.get("acceptedFiles").filter((file) => file !== event.file)
        const rejectedFiles = context.get("rejectedFiles").filter((item) => item.file !== event.file)
        context.set("acceptedFiles", files)
        context.set("rejectedFiles", rejectedFiles)
      },
      clearRejectedFiles({ context }) {
        context.set("acceptedFiles", context.get("acceptedFiles"))
        context.set("rejectedFiles", [])
      },
      clearFiles({ context }) {
        context.set("acceptedFiles", [])
        context.set("rejectedFiles", [])
      },
    },
  },
})
