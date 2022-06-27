export function queueBeforeEvent(el: Element, type: string, fn: VoidFunction) {
  const id = requestAnimationFrame(() => {
    el.removeEventListener(type, invoke, true)
    fn()
  })

  const invoke = () => {
    cancelAnimationFrame(id)
    fn()
  }

  el.addEventListener(type, invoke, { once: true, capture: true })
}
