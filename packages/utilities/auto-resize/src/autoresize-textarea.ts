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

  // Frameworks (e.g. React) may already wrap `value` with an own property that keeps
  // their internal state tracker in sync. Wrap that descriptor when present (falling
  // back to the prototype's) so programmatic writes keep flowing through it, instead
  // of re-dispatching an `input` event, which breaks controlled inputs.
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
