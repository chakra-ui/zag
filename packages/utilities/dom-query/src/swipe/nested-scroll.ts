import { getComputedStyle } from "../computed-style"
import { isHTMLElement } from "../node"
import type { SwipeDirection } from "./types"

const SCROLL_SLACK = 0.5

function canScrollOn(el: HTMLElement, vertical: boolean) {
  const style = getComputedStyle(el)
  const overflow = vertical ? style.overflowY : style.overflowX
  if (overflow !== "auto" && overflow !== "scroll" && overflow !== "overlay") return false
  return vertical ? el.scrollHeight > el.clientHeight + 1 : el.scrollWidth > el.clientWidth + 1
}

/**
 * Whether content between `target` and `container` can still scroll when a finger moves toward `direction`:
 * a finger moving down scrolls content back toward its top
 */
export function canScrollWithFinger(target: EventTarget | null, container: Element, direction: SwipeDirection) {
  if (!isHTMLElement(target)) return false
  const vertical = direction === "up" || direction === "down"
  let room = 0

  for (let el: HTMLElement | null = target; el; el = el.parentElement) {
    if (canScrollOn(el, vertical)) {
      const position = vertical ? el.scrollTop : el.scrollLeft
      const end = vertical ? el.scrollHeight - el.clientHeight : el.scrollWidth - el.clientWidth
      room += direction === "down" || direction === "right" ? position : end - position
    }
    if (el === container || el === el.ownerDocument.documentElement) break
  }

  return room > SCROLL_SLACK
}
