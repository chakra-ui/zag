import { createMachine } from "@zag-js/core"
import { compact } from "@zag-js/utils"
import { dom } from "./file-upload.dom"
import { MachineContext, MachineState, UserDefinedContext } from "./file-upload.types"
import { getAcceptAttrString, getFilesFromEvent } from "./file-upload.utils"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "fileupload",
      initial: "idle",
      context: {
        maxSize: Infinity,
        multiple: false,
        maxFiles: 0,
        value: [],
        minSize: 0,
        dropzone: true,
        ...ctx,
        invalid: false,
        validityState: null,
      },
      computed: {
        acceptAttr: (ctx) => getAcceptAttrString(ctx.accept),
      },
      on: {
        "INPUT.CHANGE": {},
        "TARGET.SET": {
          actions: ["addDragTarget"],
        },
      },
      states: {
        idle: {
          on: {
            OPEN: "open",
            "ROOT.CLICK": "open",
            "ROOT.DRAG_OVER": [
              {
                guard: "isOutOfMaxFilesRange",
                target: "dragging",
                actions: ["setOverflowValidation", "setInvalid"],
              },
              {
                target: "dragging",
              },
            ],
          },
        },
        focused: {
          on: {
            OPEN: "open",
            "ROOT.ENTER": "open",
            "ROOT.BLUR": "idle",
          },
        },
        dragging: {
          on: {
            "ROOT.DROP": {
              target: "idle",
              actions: ["clearInvalid", "clearValidation", "setFilesFromEvent", "invokeOnChange"],
            },
            "ROOT.DRAG_LEAVE": {
              target: "idle",
              actions: ["clearInvalid", "clearValidation"],
            },
          },
        },
        open: {
          activities: ["trackWindowFocus"],
          entry: ["openFilePicker"],
          on: {
            CLOSE: "focused",
          },
        },
      },
    },
    {
      guards: {
        isOutOfMaxFilesRange: (ctx, evt) => evt.count > ctx.maxFiles || evt.count + ctx.value.length > ctx.maxFiles,
      },
      activities: {
        trackWindowFocus(ctx, _evt, { send }) {
          const win = dom.getWin(ctx)
          const onWindowFocus = () => {
            setTimeout(() => {
              const inputEl = dom.getInputEl(ctx)
              if (!inputEl?.files?.length) {
                send("CLOSE")
              }
            }, 300)
          }
          win.addEventListener("focus", onWindowFocus)
          return () => win.removeEventListener("focus", onWindowFocus)
        },
      },
      actions: {
        openFilePicker(ctx) {
          requestAnimationFrame(() => {
            const inputEl = dom.getInputEl(ctx)
            inputEl?.click()
          })
        },
        setInvalid(ctx) {
          ctx.invalid = true
        },
        clearInvalid(ctx) {
          ctx.invalid = false
        },
        setOverflowValidation(ctx) {
          ctx.validityState = "rangeOverflow"
        },
        clearValidation(ctx) {
          ctx.validityState = null
        },
        setFilesFromEvent(ctx, evt) {
          console.log("-----called")
          const result = getFilesFromEvent(ctx, evt.files)
          const { acceptedFiles, fileRejections } = result
          console.log({ acceptedFiles, fileRejections })
          // ctx.onDrop?.(result)
          // if (result.fileRejections.length > 0) {
          //   ctx.onDropRejected?.({ fileRejections, acceptedFiles: [] })
          // }
          // if (result.acceptedFiles.length > 0) {
          //   ctx.onDropAccepted?.({ acceptedFiles, fileRejections: [] })
          // }
        },
        invokeOnDragEnter(ctx) {
          ctx.onDragEnter?.()
        },
        invokeOnDragLeave(ctx, evt) {
          if (!evt.hasFiles) return
          ctx.onDragLeave?.()
        },
        invokeOnChange(ctx, evt) {
          ctx.onChange?.({ files: evt.files })
        },
      },
    },
  )
}
