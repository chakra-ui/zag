import { createMachine } from "@zag-js/core"
import { addDomEvent, contains, getEventTarget, raf } from "@zag-js/dom-query"
import { getAcceptAttrString, isFileEqual } from "@zag-js/file-utils"
import { createLiveRegion } from "@zag-js/live-region"
import { callAll, warn } from "@zag-js/utils"
import * as dom from "./file-upload.dom"
import type { FileRejection, FileUploadSchema } from "./file-upload.types"
import { announce, getEventFiles, setInputFiles } from "./file-upload.utils"

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
    }
  },

  initialState() {
    return "idle"
  },

  refs() {
    return {
      liveRegion: null,
    }
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
      transforming: bindable<boolean>(() => ({
        defaultValue: false,
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

  effects: ["preventDocumentDrop", "trackLiveRegion"],

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
      trackLiveRegion({ refs, scope }) {
        // Inside the root so it is announced when the file upload is rendered within a modal dialog.
        const liveRegion = createLiveRegion({
          level: "polite",
          document: scope.getDoc(),
          root: () => dom.getRootEl(scope),
        })
        refs.set("liveRegion", liveRegion)
        return () => liveRegion.destroy()
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
            if (files.length) announce(params, (t) => t.filesAdded(files))
            return
          }

          if (files.length) {
            context.set("acceptedFiles", [files[0]])
            context.set("rejectedFiles", rejectedFiles)
            announce(params, (t) => t.filesAdded([files[0]]))
            return
          }

          if (rejectedFiles.length) {
            context.set("acceptedFiles", context.get("acceptedFiles"))
            context.set("rejectedFiles", rejectedFiles)
          }
        }

        const transform = prop("transformFiles")
        if (transform) {
          context.set("transforming", true)
          transform(acceptedFiles)
            .then(set)
            .catch((err) => {
              warn(`[zag-js/file-upload] error transforming files\n${err}`)
            })
            .finally(() => {
              context.set("transforming", false)
            })
        } else {
          set(acceptedFiles)
        }
      },
      removeFile(params) {
        const { context, event, scope } = params
        const itemType = event.itemType === "rejected" ? "rejected" : "accepted"
        const files =
          itemType === "rejected" ? context.get("rejectedFiles").map((item) => item.file) : context.get("acceptedFiles")
        const index = files.findIndex((file) => isFileEqual(file, event.file))
        if (index === -1) return

        // only restore focus when the delete trigger of the removed item had it
        const hadFocus = contains(dom.getItemDeleteTriggerEls(scope, itemType)[index], scope.getActiveElement())

        if (itemType === "rejected") {
          const rejectedFiles = context.get("rejectedFiles").filter((item) => !isFileEqual(item.file, event.file))
          context.set("rejectedFiles", rejectedFiles)
        } else {
          context.set(
            "acceptedFiles",
            files.filter((file) => !isFileEqual(file, event.file)),
          )
        }

        announce(params, (t) => t.fileDeleted(event.file))

        if (!hadFocus) return
        // once re-rendered, the next item sits at `index`, or the previous one if the last item was removed
        raf(() => {
          const triggers = dom.getItemDeleteTriggerEls(scope, itemType)
          const target =
            triggers[Math.min(index, triggers.length - 1)] || dom.getTriggerEl(scope) || dom.getDropzoneEl(scope)
          target?.focus()
        })
      },
      clearRejectedFiles({ context }) {
        context.set("rejectedFiles", [])
      },
      clearFiles({ context, scope }) {
        // the clear trigger is hidden once there are no files, so move focus before it is lost
        const hadFocus = contains(dom.getClearTriggerEl(scope), scope.getActiveElement())
        context.set("acceptedFiles", [])
        context.set("rejectedFiles", [])
        if (!hadFocus) return
        raf(() => (dom.getTriggerEl(scope) || dom.getDropzoneEl(scope))?.focus())
      },
    },
  },
})
