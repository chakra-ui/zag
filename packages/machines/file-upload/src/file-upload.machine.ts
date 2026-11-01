import { createMachine } from "@zag-js/core"
import { addDomEvent, AnimationFrame, contains, getEventTarget, raf } from "@zag-js/dom-query"
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
      focusFrame: AnimationFrame.create(),
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
    // focus first: the delete trigger unmounts with its item
    "FILE.DELETE": {
      actions: ["restoreFocusAfterDelete", "removeFile", "announceFileDeleted"],
    },
    "FILES.CLEAR": {
      actions: ["restoreFocusAfterClear", "clearFiles"],
    },
    "REJECTED_FILES.CLEAR": {
      actions: ["clearRejectedFiles"],
    },
  },

  exit: ["cancelFocusFrame"],

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
        // inside the root so a modal doesn't hide it
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
          const multiple = computed("multiple")
          const added = multiple ? files : files.slice(0, 1)
          if (!multiple && !added.length && !rejectedFiles.length) return

          if (multiple) context.set("acceptedFiles", (prev) => [...prev, ...added])
          else if (added.length) context.set("acceptedFiles", added)
          context.set("rejectedFiles", rejectedFiles)

          if (added.length) announce(params, (t) => t.filesAdded(added))
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
      removeFile({ context, event }) {
        if (event.itemType === "rejected") {
          context.set("rejectedFiles", (prev) => prev.filter((item) => !isFileEqual(item.file, event.file)))
        } else {
          context.set("acceptedFiles", (prev) => prev.filter((file) => !isFileEqual(file, event.file)))
        }
      },
      announceFileDeleted(params) {
        announce(params, (t) => t.fileDeleted(params.event.file))
      },
      restoreFocusAfterDelete({ context, event, scope, refs }) {
        const itemType = event.itemType === "rejected" ? "rejected" : "accepted"
        const files =
          itemType === "rejected" ? context.get("rejectedFiles").map((item) => item.file) : context.get("acceptedFiles")
        const index = files.findIndex((file) => isFileEqual(file, event.file))
        // skip programmatic deletes
        const triggerEl = dom.getItemDeleteTriggerEls(scope, itemType)[index]
        if (index === -1 || !contains(triggerEl, scope.getActiveElement())) return
        // next item, or the previous one if the last was removed
        refs.get("focusFrame").request(() => {
          const remaining = dom.getItemDeleteTriggerEls(scope, itemType)
          const target = remaining[Math.min(index, remaining.length - 1)] ?? dom.getFallbackFocusEl(scope)
          target?.focus()
        })
      },
      clearRejectedFiles({ context }) {
        context.set("rejectedFiles", [])
      },
      clearFiles({ context }) {
        context.set("acceptedFiles", [])
        context.set("rejectedFiles", [])
      },
      restoreFocusAfterClear({ scope, refs }) {
        // the clear trigger hides once the list is empty
        if (!contains(dom.getClearTriggerEl(scope), scope.getActiveElement())) return
        refs.get("focusFrame").request(() => dom.getFallbackFocusEl(scope)?.focus())
      },
      cancelFocusFrame({ refs }) {
        refs.get("focusFrame").cancel()
      },
    },
  },
})
