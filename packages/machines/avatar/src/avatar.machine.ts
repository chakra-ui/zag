import { createMachine } from "@zag-js/core"
import { compact } from "@zag-js/utils"
import { observeAttributes, observeChildren } from "@zag-js/mutation-observer"
import { MachineContext, MachineState, UserDefinedContext } from "./avatar.types"
import { dom } from "./avatar.dom"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "avatar",
      initial: "loading",
      activities: ["trackImageRemoval"],

      context: ctx,

      on: {
        "SRC.CHANGE": {
          target: "loading",
        },
        "IMG.UNMOUNT": {
          target: "error",
        },
      },

      states: {
        loading: {
          activities: ["trackSrcChange"],
          entry: ["checkImgStatus"],
          on: {
            "IMG.LOADED": {
              target: "loaded",
              actions: ["invokeOnLoad"],
            },
            "IMG.ERROR": {
              target: "error",
              actions: ["invokeOnError"],
            },
          },
        },
        error: {
          activities: ["trackSrcChange"],
          on: {
            "IMG.LOADED": {
              target: "loaded",
              actions: ["invokeOnLoad"],
            },
          },
        },
        loaded: {
          activities: ["trackSrcChange"],
        },
      },
    },
    {
      activities: {
        trackSrcChange(ctx, _evt, { send }) {
          const img = dom.getImageEl(ctx)
          return observeAttributes(img, ["src", "srcset"], () => {
            send({ type: "SRC.CHANGE" })
          })
        },
        trackImageRemoval(ctx, _evt, { send }) {
          const rootEl = dom.getRootEl(ctx)
          return observeChildren(rootEl, (records) => {
            const removedNodes = Array.from(records[0].removedNodes) as HTMLElement[]
            const removed = removedNodes.find((node) => node.matches("[data-scope=avatar][data-part=image]"))
            if (removed) {
              send({ type: "IMG.UNMOUNT" })
            }
          })
        },
      },
      actions: {
        invokeOnLoad(ctx) {
          ctx.onLoad?.()
        },
        invokeOnError(ctx) {
          ctx.onError?.()
        },
        checkImgStatus(ctx, _evt, { send }) {
          const img = dom.getImageEl(ctx)
          if (img?.complete) {
            send({ type: "IMG.LOADED", src: "ssr" })
          }
        },
      },
    },
  )
}
