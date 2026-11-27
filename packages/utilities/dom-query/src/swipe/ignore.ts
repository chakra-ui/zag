import { isEditableElement, isHTMLElement, isInputElement } from "../node"
import type { SwipeAxis } from "./types"

// `data-no-drag` is the older name for `data-swipe-ignore`
const IGNORE_SELECTOR = "[data-swipe-ignore],[data-no-drag]"

function ignoresAxis(el: Element, axis: SwipeAxis | undefined) {
  const value = el.getAttribute("data-swipe-ignore") ?? el.getAttribute("data-no-drag")
  return (value !== "x" && value !== "y") || !axis || value === axis
}

function isIgnoredElement(target: EventTarget | null, axis: SwipeAxis | undefined) {
  if (!isHTMLElement(target)) return false

  let marked = target.closest(IGNORE_SELECTOR)
  while (marked) {
    if (ignoresAxis(marked, axis)) return true
    marked = marked.parentElement?.closest(IGNORE_SELECTOR) ?? null
  }

  for (let el: HTMLElement | null = target; el; el = el.parentElement) {
    if (isEditableElement(el)) return true
  }

  // a range or file input has its own drag
  const input = target.closest("input")
  return isInputElement(input) && (input.type === "range" || input.type === "file")
}

/**
 * Whether a press shouldn't start a swipe: it's on a field being edited, a range or file input, or inside an
 * element marked `data-swipe-ignore` (or `data-swipe-ignore="x"` or `"y"` for one axis)
 */
export function isSwipeIgnored(
  event: { target: EventTarget | null; composedPath?: () => EventTarget[] },
  axis?: SwipeAxis,
): boolean {
  const path = typeof event.composedPath === "function" ? event.composedPath() : []
  return path.some((node) => isIgnoredElement(node, axis)) || isIgnoredElement(event.target, axis)
}
