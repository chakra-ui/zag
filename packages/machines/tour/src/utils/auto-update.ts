import { getOverflowAncestors, getWindow } from "@zag-js/dom-query"

export function autoUpdate(referenceEl: HTMLElement, update: () => void) {
  const animationFrame = false

  const ancestors = getOverflowAncestors(referenceEl)

  ancestors.forEach((ancestor) => {
    ancestor?.addEventListener("scroll", update, { passive: true })
    ancestor?.addEventListener("resize", update)
  })

  const win = getWindow(referenceEl)

  const resizeObserver = new win.ResizeObserver(update)

  if (referenceEl && !animationFrame) {
    resizeObserver.observe(referenceEl)
  }

  let frameId: number
  let prevRefRect = animationFrame ? referenceEl.getBoundingClientRect() : null

  if (animationFrame) {
    frameLoop()
  }

  function frameLoop() {
    const nextRefRect = referenceEl.getBoundingClientRect()

    if (
      prevRefRect &&
      (nextRefRect.x !== prevRefRect.x ||
        nextRefRect.y !== prevRefRect.y ||
        nextRefRect.width !== prevRefRect.width ||
        nextRefRect.height !== prevRefRect.height)
    ) {
      update()
    }

    prevRefRect = nextRefRect
    frameId = requestAnimationFrame(frameLoop)
  }

  update()

  return () => {
    ancestors.forEach((ancestor) => {
      ancestor?.removeEventListener("scroll", update)
      ancestor?.removeEventListener("resize", update)
    })

    resizeObserver?.disconnect()

    if (animationFrame) {
      cancelAnimationFrame(frameId)
    }
  }
}
