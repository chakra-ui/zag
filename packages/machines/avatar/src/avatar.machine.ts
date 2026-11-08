import { createMachine } from "@zag-js/core"
import { createSharedMutationObserver } from "@zag-js/dom-query"
import type { AvatarSchema } from "./avatar.types"
import * as dom from "./avatar.dom"

// Watches the whole subtree, so a replaced or wrapped image is still tracked
const imageObserver = /* @__PURE__ */ createSharedMutationObserver({
  childList: true,
  subtree: true,
  attributeFilter: ["src", "srcset"],
})

export const machine = createMachine<AvatarSchema>({
  initialState() {
    return "loading"
  },

  effects: ["trackImage"],

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
      checkImageStatus({ send, scope, prop }) {
        const imageEl = dom.getImageEl(scope)
        if (!imageEl?.complete) {
          prop("onStatusChange")?.({ status: "loading" })
          return
        }
        const type = hasLoaded(imageEl) ? "img.loaded" : "img.error"
        send({ type, src: "ssr" })
      },
    },

    effects: {
      trackImage({ send, scope }) {
        const rootEl = dom.getRootEl(scope)
        if (!rootEl) return

        let imageEl = dom.getImageEl(scope)

        return imageObserver.observe(rootEl, (records) => {
          const nextEl = dom.getImageEl(scope)
          const prevEl = imageEl
          imageEl = nextEl

          if (!nextEl) {
            if (prevEl) send({ type: "img.unmount" })
            return
          }

          const srcChanged = records.some((record) => record.type === "attributes" && record.target === nextEl)
          if (nextEl !== prevEl || srcChanged) send({ type: "src.change" })
        })
      },
    },
  },
})

function hasLoaded(image: HTMLImageElement) {
  return image.complete && image.naturalWidth !== 0 && image.naturalHeight !== 0
}
