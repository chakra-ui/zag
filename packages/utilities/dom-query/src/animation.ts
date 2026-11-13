import { AnimationFrame } from "./raf"

/** Calls `fn` once every animation in the element's subtree has finished. Returns a cancel function. */
export function waitForAnimationEnd(el: HTMLElement, fn: VoidFunction): VoidFunction {
  const frame = AnimationFrame.create()
  let cancelled = false

  const check = () => {
    const animations = getFiniteAnimations(el)
    if (!animations.length) {
      if (!cancelled) fn()
      return
    }
    Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
      if (!cancelled) frame.request(check)
    })
  }

  frame.request(() => frame.request(check))

  return () => {
    cancelled = true
    frame.cancel()
  }
}

function getFiniteAnimations(el: HTMLElement) {
  const animations = el.getAnimations?.({ subtree: true }) ?? []
  return animations.filter((animation) => {
    if (animation.playState === "finished" || animation.playState === "idle") return false
    return animation.effect?.getComputedTiming().endTime !== Infinity
  })
}
