import { createMachine } from "@zag-js/core"
import { addDomEvent, contains, getEventTarget, raf } from "@zag-js/dom-query"
import { getAcceptAttrString, isFileEqual } from "@zag-js/file-utils"
import { callAll, warn } from "@zag-js/utils"
import * as dom from "./file-upload.dom"
import type { FileRejection, FileUploadSchema } from "./file-upload.types"
import { getEventFiles, setInputFiles } from "./file-upload.utils"

export const machine = createMachine<FileUploadSchema>({
  props({ props }) {
    return {
      minFileSize: 0,
      maxFileSize: Number.POSITIVE_INFINITY,
      maxFiles: 1,
      allowDrop: true,
      preventDocumentDrop: true,
      defaultAcceptedFiles: [],
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
        defaultValue: prop("defaultAcceptedFiles"),
        value: prop("acceptedFiles"),
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
      actions: ["setFiles"],
    },
    "FILE.SELECT": {
      actions: ["setEventFiles"],
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
          actions: ["setEventFiles"],
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
      setFiles(params) {
        const { computed, context, event } = params
        const { acceptedFiles, rejectedFiles } = getEventFiles(params, event.files)
        context.set(
          "acceptedFiles",
          computed("multiple") ? acceptedFiles : acceptedFiles.length > 0 ? [acceptedFiles[0]] : [],
        )
        context.set("rejectedFiles", rejectedFiles)
      },
      setEventFiles(params) {
        const { computed, context, event, prop } = params

        const currentAcceptedFiles = context.get("acceptedFiles")
        const currentRejectedFiles = context.get("rejectedFiles")

        const { acceptedFiles, rejectedFiles } = getEventFiles(
          params,
          event.files,
          currentAcceptedFiles,
          currentRejectedFiles,
        )

        const set = (files: File[]) => {
          if (computed("multiple")) {
            context.set("acceptedFiles", (prev) => [...prev, ...files])
            context.set("rejectedFiles", rejectedFiles)
            return
          }

          if (files.length) {
            context.set("acceptedFiles", [files[0]])
            context.set("rejectedFiles", rejectedFiles)
            return
          }

          if (rejectedFiles.length) {
            context.set("acceptedFiles", context.get("acceptedFiles"))
            context.set("rejectedFiles", rejectedFiles)
          }
        }

        const transform = prop("transformFiles")
        if (transform) {
          transform(acceptedFiles)
            .then(set)
            .catch((err) => {
              warn(`[zag-js/file-upload] error transforming files\n${err}`)
            })
        } else {
          set(acceptedFiles)
        }
      },
      removeFile({ context, event }) {
        const files = context.get("acceptedFiles").filter((file) => !isFileEqual(file, event.file))
        const rejectedFiles = context.get("rejectedFiles").filter((item) => !isFileEqual(item.file, event.file))
        context.set("acceptedFiles", files)
        context.set("rejectedFiles", rejectedFiles)
      },
      clearRejectedFiles({ context }) {
        context.set("rejectedFiles", [])
      },
      clearFiles({ context }) {
        context.set("acceptedFiles", [])
        context.set("rejectedFiles", [])
      },
    },
  },
})
