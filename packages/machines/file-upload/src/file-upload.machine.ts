import { createMachine, guards, ref } from "@zag-js/core"
import { raf } from "@zag-js/dom-query"
import { getAcceptAttrString, isFileEqual } from "@zag-js/file-utils"
import { compact } from "@zag-js/utils"
import { dom } from "./file-upload.dom"
import type { MachineContext, MachineState, FileRejection, UserDefinedContext } from "./file-upload.types"
import { getFilesFromEvent, isFilesWithinRange } from "./file-upload.utils"

const { not } = guards

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "fileupload",
      initial: "idle",
      context: {
        minFileSize: 0,
        maxFileSize: Infinity,
        maxFiles: 1,
        allowDrop: true,
        ...ctx,
        acceptedFiles: ref([]),
        rejectedFiles: ref([]),
        invalid: false,
        translations: {
          itemPreview: (file) => `preview of ${file.name}`,
          deleteFile: (file) => `delete file ${file.name}`,
          ...ctx.translations,
        },
      },
      computed: {
        acceptAttr: (ctx) => getAcceptAttrString(ctx.accept),
        multiple: (ctx) => ctx.maxFiles > 1,
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
            "DROPZONE.DRAG_OVER": [
              {
                guard: not("isWithinRange"),
                target: "dragging",
                actions: ["setInvalid"],
              },
              { target: "dragging" },
            ],
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
            "DROPZONE.DRAG_OVER": [
              {
                guard: not("isWithinRange"),
                target: "dragging",
                actions: ["setInvalid"],
              },
              { target: "dragging" },
            ],
          },
        },
        dragging: {
          on: {
            "DROPZONE.DROP": {
              target: "idle",
              actions: ["clearInvalid", "setFilesFromEvent", "syncInputElement"],
            },
            "DROPZONE.DRAG_LEAVE": {
              target: "idle",
              actions: ["clearInvalid"],
            },
          },
        },
      },
    },
    {
      guards: {
        isWithinRange: (ctx, evt) => isFilesWithinRange(ctx, evt.count),
      },
      actions: {
        syncInputElement(ctx) {
          const inputEl = dom.getHiddenInputEl(ctx)
          if (!inputEl) return

          const win = dom.getWin(ctx)
          const dataTransfer = new win.DataTransfer()

          ctx.acceptedFiles.forEach((v) => {
            dataTransfer.items.add(v)
          })

          inputEl.files = dataTransfer.files
        },
        openFilePicker(ctx) {
          raf(() => {
            dom.getHiddenInputEl(ctx)?.click()
          })
        },
        setInvalid(ctx) {
          ctx.invalid = true
        },
        clearInvalid(ctx) {
          ctx.invalid = false
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
            set.files(ctx, [], rejectedFiles)
          }
        },
        removeFile(ctx, evt) {
          const nextFiles = ctx.acceptedFiles.filter((file) => file !== evt.file)
          ctx.acceptedFiles = ref(nextFiles)
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
