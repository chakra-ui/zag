export function queueBeforeEvent(element: Element | null, type: string, cb: () => void) {
  if (!element) return -1

  const rafId = requestAnimationFrame(() => {
    element.removeEventListener(type, exec, true)
    cb()
  })
  const exec = () => {
    cancelAnimationFrame(rafId)
    cb()
  }

  element.addEventListener(type, exec, {
    once: true,
    capture: true,
  })

  return rafId
}
