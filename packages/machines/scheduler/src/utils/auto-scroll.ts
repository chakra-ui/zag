const EDGE_THRESHOLD = 50
const MAX_SCROLL_SPEED = 12

export interface AutoScroller {
  update(point: { y: number }): void
  stop(): void
}

/** Scrolls `el` while a drag nears its top or bottom edge, faster the closer it gets. */
export function createAutoScroller(el: HTMLElement | null, win: Window): AutoScroller {
  let rafId: number | null = null
  let direction = 0

  const stop = () => {
    if (rafId != null) {
      win.cancelAnimationFrame(rafId)
      rafId = null
    }
    direction = 0
  }

  const start = () => {
    if (rafId != null || !el) return
    const tick = () => {
      if (!el || direction === 0) {
        rafId = null
        return
      }
      el.scrollTop += direction
      rafId = win.requestAnimationFrame(tick)
    }
    rafId = win.requestAnimationFrame(tick)
  }

  const speedFor = (distance: number) => Math.ceil((1 - Math.max(0, distance) / EDGE_THRESHOLD) * MAX_SCROLL_SPEED)

  const nearEdge = (distance: number) => distance < EDGE_THRESHOLD && distance > -EDGE_THRESHOLD

  return {
    update(point) {
      if (!el) return
      const rect = el.getBoundingClientRect()
      const fromTop = point.y - rect.top
      const fromBottom = rect.bottom - point.y
      if (nearEdge(fromTop)) {
        direction = -speedFor(fromTop)
        start()
      } else if (nearEdge(fromBottom)) {
        direction = speedFor(fromBottom)
        start()
      } else {
        stop()
      }
    },
    stop,
  }
}
