import { getComputedStyle, getDocument } from "@zag-js/dom-query"
import { createSharedMutationObserver, resizeObserverContentBox } from "@zag-js/dom-query/observe"

const attributeObserver = /* @__PURE__ */ createSharedMutationObserver({ attributeFilter: ["rows", "placeholder"] })

export const autoresizeTextarea = (el: HTMLTextAreaElement | null) => {
  if (!el) return

  const style = getComputedStyle(el)

  const doc = getDocument(el)

  const resize = () => {
    requestAnimationFrame(() => {
      el.style.height = "auto"
      let newHeight: number

      if (style.boxSizing === "content-box") {
        newHeight = el.scrollHeight - (parseFloat(style.paddingTop) + parseFloat(style.paddingBottom))
      } else {
        newHeight = el.scrollHeight + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth)
      }

      if (style.maxHeight !== "none" && newHeight > parseFloat(style.maxHeight)) {
        if (style.overflowY === "hidden") {
          el.style.overflowY = "scroll"
        }
        newHeight = parseFloat(style.maxHeight)
      } else if (style.overflowY !== "hidden") {
        el.style.overflowY = "hidden"
      }

      el.style.height = `${newHeight}px`
    })
  }

  el.addEventListener("input", resize)
  el.form?.addEventListener("reset", resize)

  // Prefer the framework's own value tracker when present.
  const ownDescriptor = Object.getOwnPropertyDescriptor(el, "value")
  const descriptor = ownDescriptor?.set
    ? ownDescriptor
    : Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value")

  if (descriptor?.set) {
    Object.defineProperty(el, "value", {
      ...descriptor,
      set(newValue: string) {
        descriptor.set?.call(this, newValue)
        resize()
      },
    })
  }

  const stopResizeObserver = resizeObserverContentBox.observe(el, () => requestAnimationFrame(() => resize()))
  const stopAttributeObserver = attributeObserver.observe(el, () => resize())

  doc.fonts?.addEventListener("loadingdone", resize)

  return () => {
    el.removeEventListener("input", resize)
    el.form?.removeEventListener("reset", resize)
    doc.fonts?.removeEventListener("loadingdone", resize)
    stopResizeObserver()
    stopAttributeObserver()
  }
}
