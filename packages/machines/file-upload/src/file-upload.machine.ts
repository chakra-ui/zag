import { createMachine, guards, ref } from "@zag-js/core"
import { raf } from "@zag-js/dom-query"
import { getAcceptAttrString, isFileEqual } from "@zag-js/file-utils"
import { compact } from "@zag-js/utils"
import { dom } from "./file-upload.dom"
import type { MachineContext, MachineState, RejectedFile, UserDefinedContext } from "./file-upload.types"
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
        files: ref(ctx.files ?? []),
        rejectedFiles: ref([]),
        invalid: false,
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
              actions: ["clearInvalid", "setFilesFromEvent"],
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
            const files = ref([...ctx.files, ...acceptedFiles])
            set.files(ctx, files, rejectedFiles)
            return
          }

          if (acceptedFiles.length) {
            const files = ref([acceptedFiles[0]])
            set.files(ctx, files, rejectedFiles)
          }
        },
        removeFile(ctx, evt) {
          const nextFiles = ctx.files.filter((file) => file !== evt.file)
          set.files(ctx, nextFiles)
        },
      },
      compareFns: {
        files: (a, b) => a.length === b.length && a.every((file, i) => isFileEqual(file, b[i])),
      },
    },
  )
}

const invoke = {
  change: (ctx: MachineContext) => {
    ctx.onFilesChange?.({
      acceptedFiles: ctx.files,
      rejectedFiles: ctx.rejectedFiles,
    })
  },
}

const set = {
  files: (ctx: MachineContext, acceptedFiles: File[], rejectedFiles?: RejectedFile[]) => {
    ctx.files = ref(acceptedFiles)
    if (rejectedFiles) ctx.rejectedFiles = ref(rejectedFiles)
    invoke.change(ctx)
  },
}
