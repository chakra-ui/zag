import type { ScrollbarEasing, ScrollEasingFunction } from "../scroll-area.types"

const DURATION = 300
const EASE_OUT_QUAD: ScrollEasingFunction = (t: number) => t * (2 - t)

export interface SmoothScrollOptions extends ScrollbarEasing {
  top?: number | undefined
  left?: number | undefined
  onComplete?: (() => void) | undefined
}

interface AnimationState {
  startTime: number
  startScrollTop: number
  startScrollLeft: number
  targetScrollTop: number
  targetScrollLeft: number
  rafId?: any
}

export function smoothScroll(node: HTMLElement | null | undefined, options: SmoothScrollOptions = {}) {
  const { top, left, duration = DURATION, easing = EASE_OUT_QUAD, onComplete } = options
  if (!node) return
  const state: AnimationState = {
    startTime: 0,
    startScrollTop: node.scrollTop,
    startScrollLeft: node.scrollLeft,
    targetScrollTop: top ?? node.scrollTop,
    targetScrollLeft: left ?? node.scrollLeft,
  }

  let cancelled = false

  const cleanup = () => {
    if (state.rafId) {
      cancelAnimationFrame(state.rafId)
      state.rafId = undefined
    }
    cancelled = true
  }

  const animate = (currentTime: number): void => {
    if (cancelled) return

    if (state.startTime === 0) {
      state.startTime = currentTime
    }

    const elapsed = currentTime - state.startTime
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easing(progress)

    const deltaTop = state.targetScrollTop - state.startScrollTop
    const deltaLeft = state.targetScrollLeft - state.startScrollLeft

    node.scrollTop = state.startScrollTop + deltaTop * easedProgress
    node.scrollLeft = state.startScrollLeft + deltaLeft * easedProgress

    if (progress < 1) {
      state.rafId = requestAnimationFrame(animate)
    } else {
      onComplete?.()
    }
  }

  state.rafId = requestAnimationFrame(animate)

  return cleanup
}
