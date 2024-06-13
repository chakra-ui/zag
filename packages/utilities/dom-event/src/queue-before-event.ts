export function queueBeforeEvent(element: EventTarget, type: string, cb: () => void) {
  const createTimer = (callback: () => void) => {
    const timerId = requestAnimationFrame(callback)
    return () => cancelAnimationFrame(timerId)
  }

  const cancelTimer = createTimer(() => {
    element.removeEventListener(type, callSync, true)
    cb()
  })
  const callSync = () => {
    cancelTimer()
    cb()
  }

  element.addEventListener(type, callSync, { once: true, capture: true })
  return cancelTimer
}
