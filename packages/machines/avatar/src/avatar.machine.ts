import { observeAttributes, observeChildren } from "@zag-js/dom-query"
import { createMachine } from "@zag-js/core"
import type { AvatarSchema } from "./avatar.types"
import * as dom from "./avatar.dom"

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
      checkImageStatus({ send, scope }) {
        const imageEl = dom.getImageEl(scope)
        if (!imageEl?.complete) return
        const type = hasLoaded(imageEl) ? "img.loaded" : "img.error"
        send({ type, src: "ssr" })
      },
    },
    effects: {
      trackImageRemoval({ send, scope }) {
        const rootEl = dom.getRootEl(scope)
        return observeChildren(rootEl, {
          callback(records) {
            const removedNodes = Array.from(records[0].removedNodes) as HTMLElement[]
            const removed = removedNodes.find(
              (node) => node.nodeType === Node.ELEMENT_NODE && node.matches("[data-scope=avatar][data-part=image]"),
            )
            if (removed) {
              send({ type: "img.unmount" })
            }
          },
        })
      },

      trackSrcChange({ send, scope }) {
        const imageEl = dom.getImageEl(scope)
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
