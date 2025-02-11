import { observeAttributes, observeChildren } from "@zag-js/dom-query"
import { createMachine } from "@zag-js/core"
import type { AvatarSchema } from "./avatar.types"

export const machine = createMachine<AvatarSchema>({
  initialState() {
    return "loading"
  },

  effects: ["trackImageRemoval", "trackSrcChange"],

  on: {
    "src.change": {
      target: "loading",
    },
    "img.unmount": {
      target: "error",
    },
  },

  states: {
    loading: {
      entry: ["checkImageStatus"],
      on: {
        "img.loaded": {
          target: "loaded",
          actions: ["invokeOnLoad"],
        },
        "img.error": {
          target: "error",
          actions: ["invokeOnError"],
        },
      },
    },
    error: {
      on: {
        "img.loaded": {
          target: "loaded",
          actions: ["invokeOnLoad"],
        },
      },
    },
    loaded: {
      on: {
        "img.error": {
          target: "error",
          actions: ["invokeOnError"],
        },
      },
    },
  },

  implementations: {
    actions: {
      invokeOnLoad({ prop }) {
        prop("onStatusChange")?.({ status: "loaded" })
      },

      invokeOnError({ prop }) {
        prop("onStatusChange")?.({ status: "error" })
      },
      checkImageStatus({ send }) {
        const imageEl = document.querySelector<HTMLImageElement>(".avatar-image")
        if (!imageEl?.complete) return
        const type = hasLoaded(imageEl) ? "img.loaded" : "img.error"
        send({ type, src: "ssr" })
      },
    },
    effects: {
      trackImageRemoval({ send }) {
        const rootEl = document.querySelector<HTMLElement>(".avatar-root")
        return observeChildren(rootEl, {
          callback(records) {
            const removedNodes = Array.from(records[0].removedNodes) as HTMLElement[]
            const removed = removedNodes.find(
              (node) => node.nodeType === Node.ELEMENT_NODE && node.matches(".avatar-image"),
            )
            if (removed) {
              send({ type: "img.unmount" })
            }
          },
        })
      },

      trackSrcChange({ send }) {
        const imageEl = document.querySelector<HTMLImageElement>(".avatar-image")
        return observeAttributes(imageEl, {
          attributes: ["src", "srcset"],
          callback() {
            send({ type: "src.change" })
          },
        })
      },
    },
  },
})

function hasLoaded(image: HTMLImageElement) {
  return image.complete && image.naturalWidth !== 0 && image.naturalHeight !== 0
}
