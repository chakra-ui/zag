import { getComputedStyle } from "@zag-js/dom-query"

export const autoresizeTextarea = (el: HTMLTextAreaElement | null) => {
  if (!el) return

  const style = getComputedStyle(el)
  const win = el.ownerDocument.defaultView || window

  const onInput = () => {
    el.style.height = "auto"
    const borderTopWidth = parseInt(style.borderTopWidth, 10)
    const borderBottomWidth = parseInt(style.borderBottomWidth, 10)
    el.style.height = `${el.scrollHeight + borderTopWidth + borderBottomWidth}px`
  }

  el.addEventListener("input", onInput)

  const elementPrototype = Object.getPrototypeOf(el)
  const descriptor = Object.getOwnPropertyDescriptor(elementPrototype, "value")
  Object.defineProperty(el, "value", {
    ...descriptor,
    set() {
      // @ts-ignore
      descriptor?.set?.apply(this, arguments as unknown as [unknown])
      onInput()
    },
  })

  const resizeObserver = new win.ResizeObserver(() => onInput())

  resizeObserver.observe(el)

  return () => {
    el.removeEventListener("input", onInput)
  }
}
