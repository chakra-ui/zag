import { createMachine, ref } from "@zag-js/core"
import { addDomEvent, contains, getEventTarget, raf } from "@zag-js/dom-query"
import { getAcceptAttrString, isFileEqual } from "@zag-js/file-utils"
import { callAll, compact } from "@zag-js/utils"
import { dom } from "./file-upload.dom"
import type { FileRejection, MachineContext, MachineState, UserDefinedContext } from "./file-upload.types"
import { getFilesFromEvent } from "./file-upload.utils"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "fileupload",
      initial: "idle",

      context: {
        minFileSize: 0,
        maxFileSize: Number.POSITIVE_INFINITY,
        maxFiles: 1,
        allowDrop: true,
        accept: ctx.accept,
        preventDocumentDrop: true,
        ...ctx,
        acceptedFiles: ref([]),
        rejectedFiles: ref([]),
        translations: {
          dropzone: "dropzone",
          itemPreview: (file) => `preview of ${file.name}`,
          deleteFile: (file) => `delete file ${file.name}`,
          ...ctx.translations,
        },
      },

      computed: {
        acceptAttr: (ctx) => getAcceptAttrString(ctx.accept),
        multiple: (ctx) => ctx.maxFiles > 1,
      },

      watch: {
        acceptedFiles: ["syncInputElement"],
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

      activities: ["preventDocumentDrop"],

      states: {
        idle: {
          on: {
            OPEN: {
              actions: ["openFilePicker"],
            },
            "DROPZONE.CLICK": {
              actions: ["openFilePicker"],
            },
            "DROPZONE.FOCUS": "focused",
            "DROPZONE.DRAG_OVER": "dragging",
          },
        },
        focused: {
          on: {
            "DROPZONE.BLUR": "idle",
            OPEN: {
              actions: ["openFilePicker"],
            },
            "DROPZONE.CLICK": {
              actions: ["openFilePicker"],
            },
            "DROPZONE.DRAG_OVER": "dragging",
          },
        },
        dragging: {
          on: {
            "DROPZONE.DROP": {
              target: "idle",
              actions: ["setFilesFromEvent"],
            },
            "DROPZONE.DRAG_LEAVE": "idle",
          },
        },
      },
    },
    {
      activities: {
        preventDocumentDrop(ctx) {
          if (!ctx.preventDocumentDrop) return
          if (!ctx.allowDrop) return
          if (ctx.disabled) return
          const doc = dom.getDoc(ctx)
          const onDragOver = (event: DragEvent) => {
            event?.preventDefault()
          }
          const onDrop = (event: DragEvent) => {
            if (contains(dom.getRootEl(ctx), getEventTarget(event))) return
            event.preventDefault()
          }
          return callAll(addDomEvent(doc, "dragover", onDragOver, false), addDomEvent(doc, "drop", onDrop, false))
        },
      },
      actions: {
        syncInputElement(ctx) {
          queueMicrotask(() => {
            const inputEl = dom.getHiddenInputEl(ctx)
            if (!inputEl) return

            const win = dom.getWin(ctx)
            const dataTransfer = new win.DataTransfer()

            ctx.acceptedFiles.forEach((v) => {
              dataTransfer.items.add(v)
            })

            inputEl.files = dataTransfer.files
          })
        },
        openFilePicker(ctx) {
          raf(() => {
            dom.getHiddenInputEl(ctx)?.click()
          })
        },
        setFilesFromEvent(ctx, evt) {
          const result = getFilesFromEvent(ctx, evt.files)
          const { acceptedFiles, rejectedFiles } = result

          if (ctx.multiple) {
            const files = ref([...ctx.acceptedFiles, ...acceptedFiles])
            set.files(ctx, files, rejectedFiles)
            return
          }

          if (acceptedFiles.length) {
            const files = ref([acceptedFiles[0]])
            set.files(ctx, files, rejectedFiles)
          } else if (rejectedFiles.length) {
            set.files(ctx, ctx.acceptedFiles, rejectedFiles)
          }
        },
        removeFile(ctx, evt) {
          const files = Array.from(ctx.acceptedFiles.filter((file) => file !== evt.file))
          const rejectedFiles = Array.from(ctx.rejectedFiles.filter((item) => item.file !== evt.file))
          ctx.acceptedFiles = ref(files)
          ctx.rejectedFiles = ref(rejectedFiles)
          invoke.change(ctx)
        },
        clearRejectedFiles(ctx) {
          ctx.rejectedFiles = ref([])
          invoke.change(ctx)
        },
        clearFiles(ctx) {
          ctx.acceptedFiles = ref([])
          ctx.rejectedFiles = ref([])
          invoke.change(ctx)
        },
      },
      compareFns: {
        acceptedFiles: (a, b) => a.length === b.length && a.every((file, i) => isFileEqual(file, b[i])),
      },
    },
  )
}

const invoke = {
  change: (ctx: MachineContext) => {
    ctx.onFileChange?.({
      acceptedFiles: ctx.acceptedFiles,
      rejectedFiles: ctx.rejectedFiles,
    })
  },
  accept: (ctx: MachineContext) => {
    ctx.onFileAccept?.({ files: ctx.acceptedFiles })
  },
  reject: (ctx: MachineContext) => {
    ctx.onFileReject?.({ files: ctx.rejectedFiles })
  },
}

const set = {
  files: (ctx: MachineContext, acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    ctx.acceptedFiles = ref(acceptedFiles)
    invoke.accept(ctx)

    if (rejectedFiles) {
      ctx.rejectedFiles = ref(rejectedFiles)
      invoke.reject(ctx)
    }

    invoke.change(ctx)
  },
}
