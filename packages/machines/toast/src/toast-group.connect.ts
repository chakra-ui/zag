import type { Service } from "@zag-js/core"
import { contains } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./toast.anatomy"
import * as dom from "./toast.dom"
import type { ToastGroupApi, ToastGroupSchema } from "./toast.types"
import { getGroupPlacementStyle } from "./toast.utils"

export function groupConnect<T extends PropTypes, O = any>(
  service: Service<ToastGroupSchema>,
  normalize: NormalizeProps<T>,
): ToastGroupApi<T, O> {
  //
  const { context, prop, send, refs, computed } = service

  return {
    getCount() {
      return context.get("toasts").length
    },
    getToasts() {
      return context.get("toasts")
    },
    getGroupProps(options = {}) {
      const { label = "Notifications" } = options
      const { hotkey } = prop("store").attrs
      const hotkeyLabel = hotkey.join("+").replace(/Key/g, "").replace(/Digit/g, "")
      const placement = computed("placement")
      const [side, align = "center"] = placement.split("-")

      return normalize.element({
        ...parts.group.attrs,
        dir: prop("dir"),
        tabIndex: -1,
        "aria-label": `${placement} ${label} ${hotkeyLabel}`,
        id: dom.getRegionId(placement),
        "data-placement": placement,
        "data-side": side,
        "data-align": align,
        "aria-live": "polite",
        role: "region",
        style: getGroupPlacementStyle(service, placement),
        onMouseEnter() {
          if (refs.get("ignoreMouseTimer").isActive()) return
          send({ type: "REGION.POINTER_ENTER", placement })
        },
        onMouseMove() {
          if (refs.get("ignoreMouseTimer").isActive()) return
          send({ type: "REGION.POINTER_ENTER", placement })
        },
        onMouseLeave() {
          if (refs.get("ignoreMouseTimer").isActive()) return
          send({ type: "REGION.POINTER_LEAVE", placement })
        },
        onFocus(event) {
          send({ type: "REGION.FOCUS", target: event.relatedTarget })
        },
        onBlur(event) {
          if (refs.get("isFocusWithin") && !contains(event.currentTarget, event.relatedTarget)) {
            queueMicrotask(() => send({ type: "REGION.BLUR" }))
          }
        },
      })
    },

    subscribe(fn) {
      const store = prop("store")
      return store.subscribe(() => fn(context.get("toasts")))
    },
  }
}
