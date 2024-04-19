export function queueBeforeEvent(element: Element, type: string, cb: () => void) {
  const raf = requestAnimationFrame(() => {
    element.removeEventListener(type, exec, true)
    cb()
  })
  const exec = () => {
    cancelAnimationFrame(raf)
    cb()
  }

  element.addEventListener(type, exec, {
    once: true,
    capture: true,
  })

  return raf
}
