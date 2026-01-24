import { getComputedStyle, getDocument, getWindow } from "@zag-js/dom-query"

export const autoresizeTextarea = (el: HTMLTextAreaElement | null) => {
  if (!el) return

  const style = getComputedStyle(el)

  const win = getWindow(el)
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

  const elementPrototype = Object.getPrototypeOf(el)
  const descriptor = Object.getOwnPropertyDescriptor(elementPrototype, "value")

  if (descriptor) {
    Object.defineProperty(el, "value", {
      ...descriptor,
      set(newValue: string) {
        const prevValue = descriptor.get?.call(this)
        descriptor.set?.call(this, newValue)
        resize()

        // Dispatch input event asynchronously to sync framework state trackers
        if (prevValue !== newValue) {
          queueMicrotask(() => {
            el.dispatchEvent(new win.InputEvent("input", { bubbles: true }))
          })
        }
      },
    })
  }

  const resizeObserver = new win.ResizeObserver(() => {
    requestAnimationFrame(() => resize())
  })
  resizeObserver.observe(el)

  const attrObserver = new win.MutationObserver(() => resize())
  attrObserver.observe(el, { attributes: true, attributeFilter: ["rows", "placeholder"] })

  doc.fonts?.addEventListener("loadingdone", resize)

  return () => {
    el.removeEventListener("input", resize)
    el.form?.removeEventListener("reset", resize)
    doc.fonts?.removeEventListener("loadingdone", resize)
    resizeObserver.disconnect()
    attrObserver.disconnect()
  }
}
