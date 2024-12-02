import { dom } from "./carousel.dom"
import type { MachineContext } from "./carousel.types"

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export const scrollToView = (ctx: MachineContext, index: number, behavior?: ScrollBehavior) => {
  const view = ctx.views[index]
  const slide = dom.getSlideEls(ctx).at(view[0])
  if (!slide) return

  scrollToSlide(ctx, slide, behavior)
}

export const scrollToSlide = (ctx: MachineContext, slide: HTMLElement, behavior: ScrollBehavior = "smooth") => {
  const slideGroup = dom.getSlideGroupEl(ctx)
  if (!slideGroup) return
  const slideGroupRect = slideGroup.getBoundingClientRect()
  const nextSlideRect = slide.getBoundingClientRect()

  const nextLeft = nextSlideRect.left - slideGroupRect.left
  const nextTop = nextSlideRect.top - slideGroupRect.top

  slideGroup.scrollTo({
    left: nextLeft + slideGroup.scrollLeft,
    top: nextTop + slideGroup.scrollTop,
    behavior,
  })
}

export function waitForEvent(el: HTMLElement, eventName: string): Promise<void> {
  return new Promise<void>((resolve) => {
    const listener = (event: Event) => {
      if (event.target === el) {
        el.removeEventListener(eventName, listener)
        resolve()
      }
    }
    el.addEventListener(eventName, listener)
  })
}
